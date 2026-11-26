"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAuthClient, getMembership } from "@/lib/supabase/server";
import type { FormState } from "./actions";

const UUID = z.string().uuid();
type Sb = Awaited<ReturnType<typeof createAuthClient>>;

async function ownsEvent(sb: Sb, weddingId: string, eventId: string) {
  const { data } = await sb.from("events").select("id").eq("id", eventId).eq("wedding_id", weddingId).maybeSingle();
  return Boolean(data);
}

/** Tick or untick one household × ceremony cell. */
export async function setInvite(householdId: string, eventId: string, on: boolean): Promise<{ ok: boolean }> {
  const { member } = await getMembership();
  if (!member || !UUID.safeParse(householdId).success || !UUID.safeParse(eventId).success) return { ok: false };
  const sb = await createAuthClient();
  if (!(await ownsEvent(sb, member.weddingId, eventId))) return { ok: false };
  const { data: h } = await sb.from("households").select("id").eq("id", householdId).eq("wedding_id", member.weddingId).maybeSingle();
  if (!h) return { ok: false };
  const { error } = on
    ? await sb.from("invitations").upsert({ household_id: householdId, event_id: eventId }, { onConflict: "household_id,event_id", ignoreDuplicates: true })
    : await sb.from("invitations").delete().eq("household_id", householdId).eq("event_id", eventId);
  revalidatePath("/admin/guests");
  return { ok: !error };
}

/** Shortcut: invite (or uninvite) a whole side to one ceremony. */
export async function bulkInvite(_: FormState, form: FormData): Promise<FormState> {
  const { member } = await getMembership();
  if (!member) return { error: "Please sign in again." };
  const eventId = String(form.get("event") ?? "");
  const side = String(form.get("side") ?? "");
  const on = form.get("action") !== "remove";
  if (!UUID.safeParse(eventId).success || !["all", "groom", "bride", "common"].includes(side)) return { error: "Pick a ceremony and a side." };
  const sb = await createAuthClient();
  if (!(await ownsEvent(sb, member.weddingId, eventId))) return { error: "Unknown ceremony." };
  let q = sb.from("households").select("id").eq("wedding_id", member.weddingId);
  if (side !== "all") q = q.eq("side", side);
  const { data: hs } = await q;
  const ids = (hs ?? []).map((h) => h.id as string);
  if (ids.length === 0) return { message: "No households on that side yet." };
  const { error } = on
    ? await sb.from("invitations").upsert(ids.map((household_id) => ({ household_id, event_id: eventId })), { onConflict: "household_id,event_id", ignoreDuplicates: true })
    : await sb.from("invitations").delete().eq("event_id", eventId).in("household_id", ids);
  if (error) return { error: "Couldn't update. Please try again." };
  revalidatePath("/admin/matrix");
  revalidatePath("/admin/guests");
  return { ok: true, message: `${on ? "Invited" : "Removed"} ${ids.length} household${ids.length === 1 ? "" : "s"}.`, n: Date.now() };
}

/** Record that the WhatsApp message was opened for sending. */
export async function markSent(householdId: string): Promise<{ ok: boolean; sentAt?: string }> {
  const { member } = await getMembership();
  if (!member || !UUID.safeParse(householdId).success) return { ok: false };
  const sb = await createAuthClient();
  const sentAt = new Date().toISOString();
  const { error } = await sb.from("households").update({ sent_at: sentAt }).eq("id", householdId).eq("wedding_id", member.weddingId);
  revalidatePath("/admin/guests");
  return { ok: !error, sentAt };
}

export async function saveInviteMessage(_: FormState, form: FormData): Promise<FormState> {
  const { member } = await getMembership();
  if (member?.role !== "admin") return { error: "Only admins can change the message." };
  const text = String(form.get("message") ?? "").trim();
  if (text.length < 5 || text.length > 1000) return { error: "Message should be 5–1000 characters." };
  const sb = await createAuthClient();
  const { error } = await sb.from("weddings").update({ invite_message: text }).eq("id", member.weddingId);
  if (error) return { error: "Couldn't save. Please try again." };
  revalidatePath("/admin/send");
  return { ok: true, message: "Message saved." };
}
