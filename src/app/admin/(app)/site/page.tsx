import type { Metadata } from "next";
import Link from "next/link";
import HomeTextForm from "@/components/admin/HomeTextForm";
import { createAuthClient, getMembership } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Home page text" };

export default async function SitePage() {
  const { member } = await getMembership();
  if (!member) return null;
  const sb = await createAuthClient();
  const { data: w } = await sb.from("weddings").select("hashtag, home").eq("id", member.weddingId).single();
  const home = (w?.home ?? {}) as Record<string, string>;
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-[46px] font-semibold leading-none text-maroon">Home page text</h1>
        <p className="mt-1 text-sm text-[#6B5444]">The words on the public wedding site. Names and dates come from the wedding itself; ceremonies from <Link href="/admin/ceremonies" className="font-semibold">Ceremonies</Link>.</p>
      </div>
      <HomeTextForm initial={{ ...home, hashtag: w?.hashtag ?? "" }} readOnly={member.role !== "admin"} />
    </div>
  );
}
