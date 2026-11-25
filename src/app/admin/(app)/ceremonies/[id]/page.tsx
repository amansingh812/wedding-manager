import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CeremonyForm from "@/components/admin/CeremonyForm";
import { toCeremony, type EventRow } from "@/lib/data/supabase-store";
import { createAuthClient, getMembership } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Edit ceremony" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CeremonyEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { member } = await getMembership();
  if (!member) return null;
  const { id } = await params;
  const isAdmin = member.role === "admin";
  if (id === "new") {
    if (!isAdmin) notFound();
    return (<><h1 className="mb-6 font-display text-4xl text-maroon">New ceremony</h1><CeremonyForm ceremony={null} readOnly={false} /></>);
  }
  if (!UUID.test(id)) notFound();
  const sb = await createAuthClient();
  const { data } = await sb.from("events").select("*").eq("id", id).eq("wedding_id", member.weddingId).maybeSingle();
  if (!data) notFound();
  const c = toCeremony(data as EventRow);
  return (
    <>
      <h1 className="mb-1 font-display text-4xl text-maroon">{c.name}</h1>
      <p className="mb-6 text-quiet">{isAdmin ? "Changes show on guests' invitations as soon as you save." : "Only admins can edit. Ask an admin for changes."}</p>
      <CeremonyForm ceremony={c} readOnly={!isAdmin} />
    </>
  );
}
