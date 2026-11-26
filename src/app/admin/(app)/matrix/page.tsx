import type { Metadata } from "next";
import Matrix from "@/components/admin/Matrix";
import { createAuthClient, getMembership } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Who's invited where" };

export default async function MatrixPage() {
  const { member } = await getMembership();
  if (!member) return null;
  const sb = await createAuthClient();
  const [{ data: hs }, { data: es }] = await Promise.all([
    sb.from("households").select("id, display_name, side, invitations(event_id)").eq("wedding_id", member.weddingId).order("side").order("display_name"),
    sb.from("events").select("id, name").eq("wedding_id", member.weddingId).order("sort_order"),
  ]);
  const households = (hs ?? []).map((h) => ({ id: h.id as string, name: h.display_name as string, side: h.side as string }));
  const invited = (hs ?? []).flatMap((h) => (h.invitations as { event_id: string }[]).map((i) => `${h.id}:${i.event_id}`));
  return (
    <>
      <h1 className="font-display text-4xl text-maroon">Who&apos;s invited where</h1>
      <p className="mb-6 mt-1 text-quiet">Tick a box to invite a household to a ceremony. Saves instantly; guests see it on their invitation.</p>
      {households.length ? (
        <Matrix key={invited.join("|")} households={households} events={(es ?? []).map((e) => ({ id: e.id as string, name: e.name as string }))} invited={invited} />
      ) : (
        <p className="text-quiet">Add guests first.</p>
      )}
    </>
  );
}
