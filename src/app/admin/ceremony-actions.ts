"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAuthClient, getMembership } from "@/lib/supabase/server";
import type { FormState } from "./actions";

const opt = (max: number) =>
  z.string().trim().max(max).transform((v) => (v === "" ? null : v)).nullable();
const time = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .refine((v) => v === null || /^([01]\d|2[0-3]):[0-5]\d$/.test(v), "Use a time like 18:30")
  .nullable();

const ceremonySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  subtitle: opt(60),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  date_bs: z.string().trim().min(1, "BS date is required, e.g. Fagun 16").max(30),
  starts_at: time,
  ends_at: time,
  venue_name: opt(120),
  venue_city: opt(60),
  address: opt(200),
  map_url: opt(500).refine((v) => v === null || /^https:\/\//.test(v), "Map link must start with https://"),
  dress_code: opt(60),
  dress_colors: z
    .string()
    .transform((v) => v.split(",").map((c) => c.trim()).filter(Boolean))
    .refine((list) => list.length <= 4 && list.every((c) => /^#[0-9a-fA-F]{6}$/.test(c)), "Colours must be like #8e1b1b, up to 4"),
  sort_order: z.coerce.number().int().min(0).max(99),
  is_published: z.preprocess((v) => v === "on", z.boolean()),
});

export async function saveCeremony(id: string | null, _: FormState, form: FormData): Promise<FormState> {
  const { member } = await getMembership();
  if (member?.role !== "admin") return { error: "Only admins can edit ceremonies." };
  if (id !== null && !z.string().uuid().safeParse(id).success) return { error: "Unknown ceremony." };

  const raw = Object.fromEntries(
    ["name", "subtitle", "event_date", "date_bs", "starts_at", "ends_at", "venue_name", "venue_city", "address", "map_url", "dress_code", "dress_colors", "sort_order", "is_published"].map(
      (k) => [k, form.get(k) ?? ""],
    ),
  );
  const parsed = ceremonySchema.safeParse(raw);
  // send typed values back so the form keeps them after an error
  const values = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, String(v)]));
  const fail = (error: string): FormState => ({ error, values, n: Date.now() });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the form.");

  const sb = await createAuthClient();
  if (id) {
    const { error } = await sb.from("events").update(parsed.data).eq("id", id).eq("wedding_id", member.weddingId);
    if (error) return fail("Couldn't save. Please try again.");
  } else {
    const { error } = await sb.from("events").insert({ ...parsed.data, wedding_id: member.weddingId });
    if (error) return fail("Couldn't save. Please try again.");
  }
  revalidatePath("/admin/ceremonies");
  redirect("/admin/ceremonies?saved=1");
}
