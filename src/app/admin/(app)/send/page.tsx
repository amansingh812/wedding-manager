import type { Metadata } from "next";
import SendList, { type SendRow } from "@/components/admin/SendList";
import { site } from "@/config/site";
import { createAuthClient, getMembership } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Send invites" };

export default async function SendPage() {
  const { member } = await getMembership();
  if (!member) return null;
  const sb = await createAuthClient();
  const [{ data: hs }, { data: w }] = await Promise.all([
    sb.from("households").select("id, display_name, phone_e164, slug, sent_at, open_count, invitations(count)").eq("wedding_id", member.weddingId).order("display_name"),
    sb.from("weddings").select("invite_message").eq("id", member.weddingId).single(),
  ]);
  const rows: SendRow[] = (hs ?? []).map((h) => ({
    id: h.id, name: h.display_name, phone: h.phone_e164, slug: h.slug, sentAt: h.sent_at, openCount: h.open_count,
    ceremonies: (h.invitations as { count: number }[])[0]?.count ?? 0,
  }));
  return (
    <>
      <h1 className="font-display text-4xl text-maroon">Send invites</h1>
      <p className="mb-6 mt-1 text-quiet">Each button opens WhatsApp with the message ready. Press send in WhatsApp; we mark it sent here.</p>
      <SendList rows={rows} template={w?.invite_message ?? ""} siteUrl={process.env.SITE_URL || site.url || ""} isAdmin={member.role === "admin"} />
    </>
  );
}
