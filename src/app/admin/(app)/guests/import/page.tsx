import type { Metadata } from "next";
import ImportForm from "@/components/admin/ImportForm";
import { createAuthClient, getMembership } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Paste guests" };

export default async function ImportPage() {
  const { member } = await getMembership();
  if (!member) return null;
  const sb = await createAuthClient();
  const { data } = await sb.from("events").select("id, name").eq("wedding_id", member.weddingId).order("sort_order");
  return (
    <>
      <h1 className="font-display text-4xl text-maroon">Paste from Excel</h1>
      <p className="mb-6 mt-1 text-quiet">Copy the rows in Excel or Google Sheets, paste below, check, then add. Nothing is saved until you press Add.</p>
      <ImportForm ceremonies={(data ?? []).map((e) => ({ id: e.id as string, name: e.name as string }))} />
    </>
  );
}
