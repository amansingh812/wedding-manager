import type { Metadata } from "next";
import Link from "next/link";
import { createAuthClient, getMembership } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Guests" };

const SIDE: Record<string, string> = { groom: "Groom", bride: "Bride", common: "Both" };

type Row = {
  id: string; display_name: string; phone_e164: string | null; side: string; group_tag: string | null;
  max_guests: number; sent_at: string | null; open_count: number; invitations: { count: number }[];
};

export default async function GuestsPage({ searchParams }: { searchParams: Promise<{ q?: string; side?: string; saved?: string; deleted?: string }> }) {
  const { member } = await getMembership();
  if (!member) return null;
  const { q = "", side = "", saved, deleted } = await searchParams;
  const sb = await createAuthClient();
  const { data } = await sb
    .from("households")
    .select("id, display_name, phone_e164, side, group_tag, max_guests, sent_at, open_count, invitations(count)")
    .eq("wedding_id", member.weddingId)
    .order("display_name");
  const all = (data as Row[] | null) ?? [];
  const needle = q.trim().toLowerCase();
  const rows = all.filter(
    (h) =>
      (!side || h.side === side) &&
      (!needle || h.display_name.toLowerCase().includes(needle) || (h.group_tag ?? "").toLowerCase().includes(needle) || (h.phone_e164 ?? "").includes(needle)),
  );
  const count = (s: string) => all.filter((h) => h.side === s).length;
  const people = all.reduce((n, h) => n + h.max_guests, 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-maroon">Guests</h1>
          <p className="mt-1 text-quiet">{all.length} households · up to {people} people</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/guests/import" className="rounded-full border border-sand bg-white px-4 py-2.5 font-semibold text-ink">Paste from Excel</Link>
          <Link href="/admin/guests/new" className="rounded-full bg-sindoor px-5 py-2.5 font-semibold text-ivory">Add</Link>
        </div>
      </div>
      {saved && <p role="status" className="mt-4 rounded-xl bg-cream px-4 py-2.5 text-sm text-muted">Saved {saved}.</p>}
      {deleted && <p role="status" className="mt-4 rounded-xl bg-cream px-4 py-2.5 text-sm text-muted">Household removed.</p>}

      <form className="mt-6 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search name, group or phone" className="min-w-0 flex-1 rounded-full border border-sand bg-white px-4 py-2 text-[16px] outline-none focus:border-gold" />
        <select name="side" defaultValue={side} className="rounded-full border border-sand bg-white px-3 py-2">
          <option value="">All sides</option>
          <option value="groom">Groom ({count("groom")})</option>
          <option value="bride">Bride ({count("bride")})</option>
          <option value="common">Both ({count("common")})</option>
        </select>
        <button className="rounded-full border border-sand bg-white px-4 py-2 font-semibold text-ink">Filter</button>
      </form>

      {rows.length === 0 ? (
        <p className="mt-8 text-center text-quiet">{all.length ? "No households match." : "No guests yet. Add one, or paste your list from Excel."}</p>
      ) : (
        <ul className="mt-4 divide-y divide-sand/70 rounded-2xl border border-sand bg-white">
          {rows.map((h) => {
            const invited = h.invitations[0]?.count ?? 0;
            return (
              <li key={h.id}>
                <Link href={`/admin/guests/${h.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-ivory">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-ink">{h.display_name}</span>
                    <span className="block text-xs text-quiet">
                      {SIDE[h.side]} · {h.max_guests} guests · {invited} ceremon{invited === 1 ? "y" : "ies"}{h.group_tag && ` · ${h.group_tag}`}{!h.phone_e164 && " · no phone"}
                    </span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${h.open_count ? "bg-[#e6f0e8] text-[#2f5d3a]" : h.sent_at ? "bg-cream text-muted" : "border border-dashed border-sand text-quiet"}`}>
                    {h.open_count ? `Opened ${h.open_count}×` : h.sent_at ? "Sent" : "Not sent"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
