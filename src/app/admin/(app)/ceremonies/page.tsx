import type { Metadata } from "next";
import Link from "next/link";
import { toCeremony, type EventRow } from "@/lib/data/supabase-store";
import { formatAd, formatTime } from "@/lib/format";
import { createAuthClient, getMembership } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ceremonies" };

export default async function CeremoniesPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { member } = await getMembership();
  if (!member) return null;
  const { saved } = await searchParams;
  const sb = await createAuthClient();
  const { data } = await sb.from("events").select("*").eq("wedding_id", member.weddingId).order("sort_order").order("event_date");
  const ceremonies = (data as EventRow[] | null)?.map(toCeremony) ?? [];
  const isAdmin = member.role === "admin";

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-maroon">Ceremonies</h1>
          <p className="mt-1 text-quiet">What guests see on their invitation. Fill in venues and times here.</p>
        </div>
        {isAdmin && <Link href="/admin/ceremonies/new" className="shrink-0 rounded-full bg-sindoor px-5 py-2.5 font-semibold text-ivory">Add</Link>}
      </div>
      {saved && <p role="status" className="mt-4 rounded-xl bg-cream px-4 py-2.5 text-sm text-muted">Saved. Guests see the change right away.</p>}
      <ul className="mt-6 space-y-3">
        {ceremonies.map((c) => {
          const missing = [!c.venueName && "venue", !c.startsAt && "time", !c.mapUrl && "map link"].filter(Boolean);
          return (
            <li key={c.id}>
              <Link href={`/admin/ceremonies/${c.id}`} className="block rounded-2xl border border-sand bg-white p-5 transition hover:border-gold">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl text-maroon">{c.name} {c.subtitle && <span className="font-deva text-base text-quiet">{c.subtitle}</span>}</h2>
                    <p className="text-sm text-muted">{c.dateBs} · {formatAd(c.eventDate)}{c.startsAt && ` · ${formatTime(c.startsAt)}`}</p>
                    <p className="text-sm text-quiet">{[c.venueName, c.venueCity].filter(Boolean).join(", ") || "No venue yet"}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.isPublished ? "bg-[#e6f0e8] text-[#2f5d3a]" : "bg-cream text-muted"}`}>
                    {c.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                {missing.length > 0 && <p className="mt-2 text-xs font-semibold text-marigold">Missing: {missing.join(", ")}</p>}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
