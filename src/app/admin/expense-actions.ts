"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAuthClient, getMembership } from "@/lib/supabase/server";
import type { FormState } from "./actions";

const UUID = z.string().uuid();
const money = z
  .string()
  .trim()
  .transform((v) => Number(v.replace(/[,\s]/g, "").replace(/^(rs\.?|npr|रु\.?)/i, "") || "0"))
  .refine((n) => Number.isFinite(n), "Amounts must be numbers")
  .refine((n) => n >= 0, "Amounts can't be negative")
  .refine((n) => n <= 100_000_000, "That amount looks too big");

const expenseSchema = z.object({
  title: z.string().trim().min(1, "What is it for?").max(100),
  event_id: z.string().transform((v) => (v === "" ? null : v)).pipe(UUID.nullable()),
  vendor_name: z.string().trim().max(80).transform((v) => v || null),
  vendor_phone: z.string().trim().max(30).transform((v) => v || null),
  total_amount: money,
  paid_amount: money,
  notes: z.string().trim().max(500).transform((v) => v || null),
}).refine((e) => e.paid_amount <= e.total_amount, { message: "Paid can't be more than the total", path: ["paid_amount"] });

export async function saveExpense(id: string | null, _: FormState, form: FormData): Promise<FormState> {
  const { member } = await getMembership();
  if (member?.role !== "admin") return { error: "Only admins can change expenses." };
  if (id !== null && !UUID.safeParse(id).success) return { error: "Unknown expense." };
  const raw = Object.fromEntries(["title", "event_id", "vendor_name", "vendor_phone", "total_amount", "paid_amount", "notes"].map((k) => [k, String(form.get(k) ?? "")]));
  const fail = (error: string): FormState => ({ error, values: raw, n: Date.now() });
  const parsed = expenseSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the form.");
  const sb = await createAuthClient();
  if (parsed.data.event_id) {
    const { data } = await sb.from("events").select("id").eq("id", parsed.data.event_id).eq("wedding_id", member.weddingId).maybeSingle();
    if (!data) return fail("Unknown ceremony.");
  }
  if (id) {
    const { error } = await sb.from("expenses").update(parsed.data).eq("id", id).eq("wedding_id", member.weddingId);
    if (error) return fail("Couldn't save. Please try again.");
  } else {
    const { data: { user } } = await sb.auth.getUser();
    const { error } = await sb.from("expenses").insert({ ...parsed.data, wedding_id: member.weddingId, created_by: user?.id ?? null });
    if (error) return fail("Couldn't save. Please try again.");
  }
  revalidatePath("/admin/expenses");
  redirect("/admin/expenses?saved=1");
}

export async function deleteExpense(form: FormData) {
  const { member } = await getMembership();
  if (member?.role !== "admin") return;
  const id = UUID.safeParse(form.get("id"));
  if (!id.success || form.get("confirm") !== "yes") return;
  const sb = await createAuthClient();
  await sb.from("expenses").delete().eq("id", id.data).eq("wedding_id", member.weddingId);
  revalidatePath("/admin/expenses");
  redirect("/admin/expenses?deleted=1");
}
