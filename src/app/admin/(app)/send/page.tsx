import type { Metadata } from "next";
import Image from "next/image";
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
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-night px-6 py-8 text-ivory">
        <Image src="/images/diyas.jpg" alt="" fill priority sizes="720px" className="object-cover opacity-55" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,11,16,.9),rgba(27,11,16,.35))]" />
        <div className="relative">
          <h1 className="font-display text-4xl">Send invites</h1>
          <p className="mt-1 max-w-md text-ivory/80">Each button opens WhatsApp with the message ready. Press send in WhatsApp; we mark it sent here.</p>
        </div>
      </section>
      <SendList rows={rows} template={w?.invite_message ?? ""} siteUrl={process.env.SITE_URL || site.url || ""} isAdmin={member.role === "admin"} />
    </>
  );
}
