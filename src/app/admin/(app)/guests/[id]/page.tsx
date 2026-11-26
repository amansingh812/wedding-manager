import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuestForm, { type GuestFormData } from "@/components/admin/GuestForm";
import { createAuthClient, getMembership } from "@/lib/supabase/server";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Household" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function GuestEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { member } = await getMembership();
  if (!member) return null;
  const { id } = await params;
  if (id !== "new" && !UUID.test(id)) notFound();
  const sb = await createAuthClient();
  const { data: events } = await sb.from("events").select("id, name, date_bs").eq("wedding_id", member.weddingId).order("sort_order");
  const ceremonies = (events ?? []).map((e) => ({ id: e.id as string, name: e.name as string, dateBs: e.date_bs as string }));

  let household: GuestFormData | null = null;
  if (id !== "new") {
    const { data: h } = await sb
      .from("households")
      .select("id, display_name, contact_name, phone_e164, side, group_tag, max_guests, notes, slug, invitations(event_id)")
      .eq("id", id)
      .eq("wedding_id", member.weddingId)
      .maybeSingle();
    if (!h) notFound();
    household = {
      id: h.id, displayName: h.display_name, contactName: h.contact_name, phone: h.phone_e164, side: h.side,
      groupTag: h.group_tag, maxGuests: h.max_guests, notes: h.notes, slug: h.slug,
      eventIds: (h.invitations as { event_id: string }[]).map((i) => i.event_id),
    };
  }
  return (
    <>
      <h1 className="mb-6 font-display text-4xl text-maroon">{household?.displayName ?? "New household"}</h1>
      <GuestForm household={household} ceremonies={ceremonies} siteUrl={process.env.SITE_URL || site.url || ""} />
    </>
  );
}
