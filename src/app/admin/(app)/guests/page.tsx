import type { Metadata } from "next";
import Link from "next/link";
import { createAuthClient, getMembership } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Guests & invites" };

const SIDE: Record<string, string> = { groom: "Groom", bride: "Bride", common: "Friends" };
const PILL: Record<string, string> = {
  Opened: "bg-[#E3F1E6] text-[#1F6B3A]",
  Sent: "bg-[#F3E4DA] text-[#7A3A1E]",
  "Not sent": "bg-[#EEE7DC] text-[#5A4636]",
};
const FILTERS = [["", "All"], ["groom", "Groom side"], ["bride", "Bride side"], ["common", "Friends"], ["unopened", "Not opened"], ["unsent", "Not sent"]] as const;

type Row = {
  id: string; display_name: string; phone_e164: string | null; side: string; group_tag: string | null;
  max_guests: number; sent_at: string | null; open_count: number; invitations: { count: number }[];
};
const status = (h: Row) => (h.open_count > 0 ? "Opened" : h.sent_at ? "Sent" : "Not sent");
/** "+9779812345678" → "+977 98•• ••• 678" (country code first: Nepal, India, else 1–3 digits). */
const maskPhone = (p: string | null) => (p ? p.replace(/^(\+977|\+91|\+\d{1,3}?)(\d{2})\d+(\d{3})$/, "$1 $2•• ••• $3") : "No phone");

export default async function GuestsPage({ searchParams }: { searchParams: Promise<{ q?: string; f?: string; saved?: string; deleted?: string }> }) {
  const { member } = await getMembership();
  if (!member) return null;
  const { q = "", f = "", saved, deleted } = await searchParams;
  const sb = await createAuthClient();
  const { data } = await sb
    .from("households")
    .select("id, display_name, phone_e164, side, group_tag, max_guests, sent_at, open_count, invitations(count)")
    .eq("wedding_id", member.weddingId)
    .order("display_name");
  const all = (data as Row[] | null) ?? [];
  const needle = q.trim().toLowerCase();
  const rows = all.filter((h) => {
    if (["groom", "bride", "common"].includes(f) && h.side !== f) return false;
    if (f === "unopened" && h.open_count > 0) return false;
    if (f === "unsent" && (h.sent_at || h.open_count > 0)) return false;
    return !needle || h.display_name.toLowerCase().includes(needle) || (h.group_tag ?? "").toLowerCase().includes(needle) || (h.phone_e164 ?? "").includes(needle);
  });
  const people = all.reduce((n, h) => n + h.max_guests, 0);
  const href = (nf: string) => `/admin/guests?${new URLSearchParams({ ...(q ? { q } : {}), ...(nf ? { f: nf } : {}) })}`;

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[46px] font-semibold leading-none text-maroon">Guests &amp; invites</h1>
          <span className="text-sm text-[#6B5444]">{all.length} households · up to {people} people</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/admin/guests/import" className="inline-flex min-h-11 items-center rounded-full border border-gold px-[18px] text-sm font-semibold text-maroon no-underline hover:bg-[#FFF4DC]">Paste from Excel</Link>
          <Link href="/admin/guests/new" className="inline-flex min-h-11 items-center rounded-full bg-sindoor px-5 text-sm font-semibold text-[#FFF7E8] no-underline hover:bg-[#6E1316]">+ Add household</Link>
        </div>
      </div>
      {saved && <p role="status" className="rounded-xl bg-[#FBEBC8] px-4 py-2.5 text-sm text-[#7A5410]">Saved {saved}.</p>}
      {deleted && <p role="status" className="rounded-xl bg-[#FBEBC8] px-4 py-2.5 text-sm text-[#7A5410]">Household removed.</p>}

      <div className="flex flex-wrap items-center gap-3">
        <form className="flex min-h-[46px] flex-[1_1_260px] items-center gap-2.5 rounded-full border border-[#EADBC0] bg-[#FFFBF3] px-[18px] focus-within:border-gold focus-within:shadow-[0_0_0_3px_rgba(201,162,74,.22)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A6A3B" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <label htmlFor="gq" className="sr-only">Search households</label>
          <input id="gq" name="q" type="search" defaultValue={q} placeholder="Search family, group or phone" className="!min-h-0 flex-1 !border-0 !bg-transparent text-[15px] !shadow-none outline-none" />
          {f && <input type="hidden" name="f" value={f} />}
        </form>
        <div role="group" aria-label="Filter" className="flex flex-wrap gap-2">
          {FILTERS.map(([k, label]) => {
            const on = f === k;
            return (
              <Link key={k || "all"} href={href(k)} aria-pressed={on}
                className={`inline-flex min-h-11 items-center rounded-full border px-4 text-[13px] font-semibold no-underline ${on ? "border-maroon bg-maroon text-[#FFF7E8]" : "border-[#E2CFAB] bg-[#FFFBF3] text-maroon hover:border-gold hover:bg-[#FFF4DC]"}`}>
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto rounded-[22px] border border-[#EADBC0] bg-[#FFFBF3]">
        {rows.length === 0 ? (
          <p className="p-10 text-center text-[#6B5444]">{all.length ? "No households match." : "No guests yet. Add one, or paste your list from Excel."}</p>
        ) : (
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[1px] text-[#6B5444]">
                <th className="px-5 py-4 font-semibold">Household</th>
                <th className="px-2 py-4 font-semibold">Side</th>
                <th className="px-2 py-4 font-semibold">Group</th>
                <th className="px-2 py-4 text-center font-semibold">Ceremonies</th>
                <th className="px-2 py-4 text-center font-semibold">Max</th>
                <th className="px-2 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Invite</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((h) => {
                const st = status(h);
                return (
                  <tr key={h.id} className="border-t border-[#F0E4CC] transition-colors hover:bg-[#FDF6E8]">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/guests/${h.id}`} className="flex flex-col gap-0.5 no-underline">
                        <span className="text-[15px] font-semibold text-ink hover:text-sindoor">{h.display_name}</span>
                        <span className="text-xs text-[#6B5444]">{maskPhone(h.phone_e164)}</span>
                      </Link>
                    </td>
                    <td className="px-2 py-3.5 text-[#5A4636]">{SIDE[h.side]}</td>
                    <td className="px-2 py-3.5 text-[#5A4636]">{h.group_tag ?? "—"}</td>
                    <td className="px-2 py-3.5 text-center font-semibold">{h.invitations[0]?.count ?? 0}</td>
                    <td className="px-2 py-3.5 text-center font-semibold">{h.max_guests}</td>
                    <td className="px-2 py-3.5"><span className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${PILL[st]}`}>{st}{h.open_count > 1 ? ` ${h.open_count}×` : ""}</span></td>
                    <td className="px-5 py-2.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link href={`/admin/guests/${h.id}`} className="inline-flex min-h-11 items-center rounded-full border border-[#E2CFAB] px-3.5 text-[13px] font-semibold text-maroon no-underline hover:border-gold hover:bg-[#FFF4DC]">Edit</Link>
                        <Link href="/admin/send" aria-label={`Send invite on WhatsApp to ${h.display_name}`} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#25B566] px-3.5 text-[13px] font-semibold text-white no-underline hover:bg-[#1E9E57]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1 1 21 11.5z" /></svg>
                          {st === "Not sent" ? "Send" : "Resend"}
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
