"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { STARTERS } from "@/lib/checklist-starters";
import { createAuthClient, getMembership } from "@/lib/supabase/server";
import type { FormState } from "./actions";

const UUID = z.string().uuid();
const optUuid = z.string().transform((v) => (v === "" ? null : v)).pipe(UUID.nullable());

const itemSchema = z.object({
  title: z.string().trim().min(1, "Write what needs doing").max(120),
  kind: z.enum(["buy", "bring", "do", "book"]),
  event_id: optUuid,
  group_name: z.string().trim().max(40).transform((v) => v || null),
  quantity: z.string().trim().max(30).transform((v) => v || null),
  owner_id: optUuid,
  due_date: z.string().transform((v) => v || null).pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable()),
});

export async function addItem(_: FormState, form: FormData): Promise<FormState> {
  const { member } = await getMembership();
  if (!member) return { error: "Please sign in again." };
  const raw = Object.fromEntries(["title", "kind", "event_id", "group_name", "quantity", "owner_id", "due_date"].map((k) => [k, String(form.get(k) ?? "")]));
  const parsed = itemSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the item.", values: raw, n: Date.now() };
  const sb = await createAuthClient();
  if (parsed.data.event_id) {
    const { data } = await sb.from("events").select("id").eq("id", parsed.data.event_id).eq("wedding_id", member.weddingId).maybeSingle();
    if (!data) return { error: "Unknown ceremony." };
  }
  if (parsed.data.owner_id) {
    const { data } = await sb.from("members").select("user_id").eq("wedding_id", member.weddingId).eq("user_id", parsed.data.owner_id).maybeSingle();
    if (!data) return { error: "Pick someone from the family list.", values: raw, n: Date.now() };
  }
  const { error } = await sb.from("checklist_items").insert({ ...parsed.data, wedding_id: member.weddingId });
  if (error) return { error: "Couldn't add. Please try again.", values: raw, n: Date.now() };
  revalidatePath("/admin/checklists");
  return { ok: true, message: `Added “${parsed.data.title}”.`, n: Date.now() };
}

export async function setItemDone(id: string, done: boolean): Promise<{ ok: boolean }> {
  const { member } = await getMembership();
  if (!member || !UUID.safeParse(id).success) return { ok: false };
  const sb = await createAuthClient();
  const { error } = await sb
    .from("checklist_items")
    .update({ status: done ? "done" : "todo", done_at: done ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("wedding_id", member.weddingId);
  revalidatePath("/admin/checklists");
  revalidatePath("/admin");
  return { ok: !error };
}

export async function deleteItem(form: FormData) {
  const { member } = await getMembership();
  if (member?.role !== "admin") return;
  const id = UUID.safeParse(form.get("id"));
  if (!id.success) return;
  const sb = await createAuthClient();
  await sb.from("checklist_items").delete().eq("id", id.data).eq("wedding_id", member.weddingId);
  revalidatePath("/admin/checklists");
}

/** Add the starter list for a ceremony, skipping items already on it (same title). */
export async function addStarters(_: FormState, form: FormData): Promise<FormState> {
  const { member } = await getMembership();
  if (!member) return { error: "Please sign in again." };
  const eventId = UUID.safeParse(form.get("event_id"));
  if (!eventId.success) return { error: "Pick a ceremony first." };
  const sb = await createAuthClient();
  const { data: ev } = await sb.from("events").select("id, kind").eq("id", eventId.data).eq("wedding_id", member.weddingId).maybeSingle();
  const starters = ev?.kind ? STARTERS[ev.kind as string] : undefined;
  if (!starters) return { error: "No starter list for this ceremony. Add items yourself." };
  const { data: existing } = await sb.from("checklist_items").select("title").eq("event_id", eventId.data);
  const have = new Set((existing ?? []).map((i) => (i.title as string).toLowerCase()));
  const rows = starters
    .filter((s) => !have.has(s.title.toLowerCase()))
    .map((s, i) => ({ wedding_id: member.weddingId, event_id: eventId.data, title: s.title, kind: s.kind, group_name: s.group, quantity: s.qty ?? null, sort_order: i }));
  if (rows.length === 0) return { message: "Starter items are already on the list." };
  const { error } = await sb.from("checklist_items").insert(rows);
  if (error) return { error: "Couldn't add starter items." };
  revalidatePath("/admin/checklists");
  return { ok: true, message: `Added ${rows.length} starter items.` };
}
