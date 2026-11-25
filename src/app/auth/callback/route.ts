import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Magic-link landing: swap the one-time code for a session, then claim any family invite. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const base = process.env.SITE_URL || url.origin;
  if (!code) return NextResponse.redirect(`${base}/admin/login?error=link`);
  const sb = await createAuthClient();
  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${base}/admin/login?error=expired`);
  await sb.rpc("claim_member_invites");
  return NextResponse.redirect(`${base}/admin`);
}
