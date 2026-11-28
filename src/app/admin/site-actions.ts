"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAuthClient, getMembership } from "@/lib/supabase/server";
import type { FormState } from "./actions";

const text = (max: number) => z.string().trim().max(max);
const schema = z.object({
  hashtag: text(40).refine((v) => v === "" || /^#\S+$/.test(v), "Hashtag must start with # and have no spaces"),
  nickname: text(40),
  blessing: text(200),
  welcome: text(300),
  groomFamily: text(60), groomTradition: text(40), groomFrom: text(60), groomNote: text(200),
  brideFamily: text(60), brideTradition: text(40), brideFrom: text(60), brideNote: text(200),
});
const HOME_FIELDS = Object.keys(schema.shape) as (keyof z.infer<typeof schema>)[];

export async function saveHomeText(_: FormState, form: FormData): Promise<FormState> {
  const { member } = await getMembership();
  if (member?.role !== "admin") return { error: "Only admins can change the home page." };
  const raw = Object.fromEntries(HOME_FIELDS.map((k) => [k, String(form.get(k) ?? "")]));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form.", values: raw, n: Date.now() };
  const { hashtag, ...home } = parsed.data;
  // drop empty values so the page falls back to its defaults
  const cleaned = Object.fromEntries(Object.entries(home).filter(([, v]) => v !== ""));
  const sb = await createAuthClient();
  const { error } = await sb.from("weddings").update({ home: cleaned, hashtag: hashtag || null }).eq("id", member.weddingId);
  if (error) return { error: "Couldn't save. Please try again.", values: raw, n: Date.now() };
  revalidatePath("/");
  revalidatePath("/admin/site");
  return { ok: true, message: "Saved. The home page shows it now." };
}
