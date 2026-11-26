"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { makeSlug, normalizePhone, parsePaste, type ImportRow, type Side } from "@/lib/guests";
import { createAuthClient, getMembership } from "@/lib/supabase/server";
import type { FormState } from "./actions";

type Sb = Awaited<ReturnType<typeof createAuthClient>>;
const UUID = z.string().uuid();

/** Ceremony ids from checkboxes, kept only if they belong to this wedding. */
async function validEventIds(sb: Sb, weddingId: string, raw: FormDataEntryValue[]): Promise<string[]> {
  const ids = raw.map(String).filter((v) => UUID.safeParse(v).success);
  if (ids.length === 0) return [];
  const { data } = await sb.from("events").select("id").eq("wedding_id", weddingId).in("id", ids);
  return (data ?? []).map((e) => e.id as string);
}

/** Insert a household with a fresh slug; retries if the random slug happens to collide. */
async function insertHousehold(sb: Sb, row: Record<string, unknown>, name: string): Promise<string | null> {
  for (let i = 0; i < 3; i++) {
    const { data, error } = await sb.from("households").insert({ ...row, slug: makeSlug(name) }).select("id").single();
    if (!error) return data.id as string;
    if (error.code !== "23505") { console.error("insert household", error.message); return null; }
  }
  return null;
}

const householdSchema = z.object({
  display_name: z.string().trim().min(1, "Name is required").max(80),
  contact_name: z.string().trim().max(80).transform((v) => v || null),
  phone: z.string().trim().max(30),
  side: z.enum(["groom", "bride", "common"]),
  group_tag: z.string().trim().max(40).transform((v) => v || null),
  max_guests: z.coerce.number().int().min(1, "Guests must be 1–30").max(30, "Guests must be 1–30"),
  notes: z.string().trim().max(500).transform((v) => v || null),
});

export async function saveHousehold(id: string | null, _: FormState, form: FormData): Promise<FormState> {
  const { member } = await getMembership();
  if (!member) return { error: "Please sign in again." };
  if (id !== null && !UUID.safeParse(id).success) return { error: "Unknown household." };
  const raw = Object.fromEntries(["display_name", "contact_name", "phone", "side", "group_tag", "max_guests", "notes"].map((k) => [k, String(form.get(k) ?? "")]));
  const events = form.getAll("events").map(String);
  const fail = (error: string): FormState => ({ error, values: { ...raw, events: events.join(",") }, n: Date.now() });
  const parsed = householdSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the form.");
  const phone = normalizePhone(parsed.data.phone);
  if (parsed.data.phone && !phone) return fail("Phone not recognised. Use e.g. 9812345678 or +91 98765 43210.");
  const { display_name, contact_name, side, group_tag, max_guests, notes } = parsed.data;
  const row = { display_name, contact_name, side, group_tag, max_guests, notes, phone_e164: phone };

  const sb = await createAuthClient();
  let householdId = id;
  if (id) {
    const { error } = await sb.from("households").update(row).eq("id", id).eq("wedding_id", member.weddingId);
    if (error) return fail("Couldn't save. Please try again.");
  } else {
    householdId = await insertHousehold(sb, { ...row, wedding_id: member.weddingId }, row.display_name);
    if (!householdId) return fail("Couldn't save. Please try again.");
  }

  // sync ceremony invitations
  const wanted = await validEventIds(sb, member.weddingId, events);
  const { data: current } = await sb.from("invitations").select("event_id").eq("household_id", householdId!);
  const have = new Set((current ?? []).map((r) => r.event_id as string));
  const toAdd = wanted.filter((e) => !have.has(e));
  const toRemove = [...have].filter((e) => !wanted.includes(e));
  if (toAdd.length) await sb.from("invitations").insert(toAdd.map((event_id) => ({ household_id: householdId, event_id })));
  if (toRemove.length) await sb.from("invitations").delete().eq("household_id", householdId!).in("event_id", toRemove);

  revalidatePath("/admin/guests");
  redirect(`/admin/guests?saved=${encodeURIComponent(row.display_name)}`);
}

export async function deleteHousehold(form: FormData) {
  const { member } = await getMembership();
  if (!member) return;
  const id = UUID.safeParse(form.get("id"));
  if (!id.success || form.get("confirm") !== "yes") return;
  const sb = await createAuthClient();
  await sb.from("households").delete().eq("id", id.data).eq("wedding_id", member.weddingId);
  revalidatePath("/admin/guests");
  redirect("/admin/guests?deleted=1");
}

export type PreviewRow = ImportRow & { duplicate: boolean };
export type ImportState = { error?: string; rows?: PreviewRow[]; imported?: number; skipped?: number };

export async function importGuests(_: ImportState, form: FormData): Promise<ImportState> {
  const { member } = await getMembership();
  if (!member) return { error: "Please sign in again." };
  const text = String(form.get("text") ?? "");
  if (text.length > 100_000) return { error: "That's too much at once. Paste up to about 1,000 rows." };
  const side = (["groom", "bride", "common"].includes(String(form.get("side"))) ? form.get("side") : "common") as Side;
  const rows = parsePaste(text, side).slice(0, 1000);
  if (rows.length === 0) return { error: "Nothing to import. Paste rows copied from Excel or Google Sheets." };

  const sb = await createAuthClient();
  const { data: existing } = await sb.from("households").select("display_name, phone_e164").eq("wedding_id", member.weddingId);
  const names = new Set((existing ?? []).map((h) => (h.display_name as string).toLowerCase()));
  const phones = new Set((existing ?? []).map((h) => h.phone_e164 as string | null).filter(Boolean));
  const seen = new Set<string>();
  const preview: PreviewRow[] = rows.map((r) => {
    const key = r.displayName.toLowerCase();
    const duplicate = names.has(key) || (r.phone !== null && phones.has(r.phone)) || seen.has(key);
    seen.add(key);
    return { ...r, duplicate };
  });

  if (form.get("mode") !== "import") return { rows: preview };

  const events = await validEventIds(sb, member.weddingId, form.getAll("events"));
  // One insert for all households + one for all invitations: Cloudflare's free plan allows
  // only 50 outside calls per request, so a call per row would fail on big lists.
  const good = preview.filter((r) => !r.problems.length && !r.duplicate);
  let imported = 0;
  for (let attempt = 0; attempt < 3 && good.length; attempt++) {
    const { data, error } = await sb
      .from("households")
      .insert(good.map((r) => ({
        wedding_id: member.weddingId, display_name: r.displayName, phone_e164: r.phone, side: r.side,
        max_guests: r.maxGuests, group_tag: r.groupTag, slug: makeSlug(r.displayName),
      })))
      .select("id");
    if (error?.code === "23505") continue; // a random slug collided: whole batch rolled back, retry with new slugs
    if (error) { console.error("import households", error.message); return { error: "Couldn't add the guests. Please try again." }; }
    const ids = (data ?? []).map((h) => h.id as string);
    if (events.length && ids.length) {
      const { error: invErr } = await sb.from("invitations").insert(ids.flatMap((household_id) => events.map((event_id) => ({ household_id, event_id }))));
      if (invErr) console.error("import invitations", invErr.message);
    }
    imported = ids.length;
    break;
  }
  revalidatePath("/admin/guests");
  return { imported, skipped: preview.length - imported };
}
