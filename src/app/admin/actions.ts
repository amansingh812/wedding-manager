"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authConfigured, createAuthClient, getMembership } from "@/lib/supabase/server";
import { allow, clientIp } from "@/lib/ratelimit";
import { createClient } from "@supabase/supabase-js";

export type FormState = { ok?: boolean; error?: string; message?: string };

const emailSchema = z.string().trim().toLowerCase().email().max(200);

export async function sendMagicLink(_: FormState, form: FormData): Promise<FormState> {
  if (!authConfigured()) return { error: "Login isn't set up yet." };
  const email = emailSchema.safeParse(form.get("email"));
  if (!email.success) return { error: "Please enter a valid email address." };
  if (!(await allow("RSVP_LIMITER", `login:${clientIp(await headers())}`))) {
    return { error: "Too many tries. Please wait a minute." };
  }
  const sent = { ok: true, message: `If ${email.data} is on the family list, a sign-in link is on its way. Check your inbox.` };
  // Only email people on the family list, so the site can't be used to spam strangers.
  const service = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: allowed, error: checkError } = await service.rpc("login_allowed", { p_email: email.data });
  if (checkError) {
    console.error("login_allowed", checkError.message);
    return { error: "Couldn't send the link right now. Please try again in a few minutes." };
  }
  if (!allowed) return sent; // same reply either way: don't reveal who's on the list
  const sb = await createAuthClient();
  const base = process.env.SITE_URL || "";
  const { error } = await sb.auth.signInWithOtp({
    email: email.data,
    options: { emailRedirectTo: `${base}/auth/callback` },
  });
  if (error) {
    console.error("signInWithOtp", error.message);
    return { error: "Couldn't send the link right now. Please try again in a few minutes." };
  }
  return sent;
}

export async function signOut() {
  const sb = await createAuthClient();
  await sb.auth.signOut();
  redirect("/admin/login");
}

const inviteSchema = z.object({
  email: emailSchema,
  name: z.string().trim().min(1).max(80),
  role: z.enum(["admin", "family"]),
});

export async function inviteMember(_: FormState, form: FormData): Promise<FormState> {
  const { member } = await getMembership();
  if (member?.role !== "admin") return { error: "Only admins can add family members." };
  const parsed = inviteSchema.safeParse({ email: form.get("email"), name: form.get("name"), role: form.get("role") });
  if (!parsed.success) return { error: "Please fill in a name and a valid email." };
  const sb = await createAuthClient();
  const { error } = await sb.from("member_invites").upsert({ wedding_id: member.weddingId, ...parsed.data });
  if (error) return { error: "Couldn't save. Please try again." };
  revalidatePath("/admin/members");
  return { ok: true, message: `${parsed.data.name} can now sign in with ${parsed.data.email}.` };
}

export async function removeInvite(form: FormData) {
  const { member } = await getMembership();
  if (member?.role !== "admin") return;
  const email = emailSchema.safeParse(form.get("email"));
  if (!email.success) return;
  const sb = await createAuthClient();
  await sb.from("member_invites").delete().eq("wedding_id", member.weddingId).eq("email", email.data);
  revalidatePath("/admin/members");
}

export async function removeMember(form: FormData) {
  const { member } = await getMembership();
  if (member?.role !== "admin") return;
  const userId = z.string().uuid().safeParse(form.get("userId"));
  if (!userId.success) return;
  const sb = await createAuthClient();
  const { data: me } = await sb.auth.getUser();
  if (me.user?.id === userId.data) return; // can't remove yourself
  await sb.from("members").delete().eq("wedding_id", member.weddingId).eq("user_id", userId.data);
  revalidatePath("/admin/members");
}
