import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { daysUntil, formatAd, formatTime } from "@/lib/format";
import { npr } from "@/lib/money";
import { createAuthClient, getMembership } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Family dashboard" };

type H = { id: string; display_name: string; side: string; max_guests: number; sent_at: string | null; open_count: number; invitations: { event_id: string }[] };
const SIDE: Record<string, string> = { groom: "Groom side", bride: "Bride side", common: "Friends" };
const AVATAR = ["#8E1B1B", "#B5651D", "#6B4E2E", "#9C7A2E"];
const initials = (n: string) => n.replace(/[^A-Za-z\s]/g, " ").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "•";
const card = "rounded-[20px] border border-[#EADBC0] bg-[#FFFBF3]";

export default async function AdminHome() {
  const { member } = await getMembership();
  if (!member) return null;
  const sb = await createAuthClient();
  const today = new Date(Date.now() + (5 * 60 + 45) * 60_000).toISOString().slice(0, 10);
  const [{ data: w }, { data: hs }, { data: es }, { data: cl }, { data: xs }] = await Promise.all([
    sb.from("weddings").select("title, main_date, main_date_bs").eq("id", member.weddingId).single(),
    sb.from("households").select("id, display_name, side, max_guests, sent_at, open_count, invitations(event_id)").eq("wedding_id", member.weddingId).order("display_name"),
    sb.from("events").select("id, name, event_date, date_bs, starts_at, image_path").eq("wedding_id", member.weddingId).order("sort_order"),
    sb.from("checklist_items").select("status, due_date").eq("wedding_id", member.weddingId),
    sb.from("expenses").select("total_amount, paid_amount").eq("wedding_id", member.weddingId),
  ]);

  const households = (hs as H[] | null) ?? [];
  const events = es ?? [];
  const n = households.length;
  const people = households.reduce((s, h) => s + h.max_guests, 0);
  const groom = households.filter((h) => h.side === "groom").length;
  const bride = households.filter((h) => h.side === "bride").length;
  const opened = households.filter((h) => h.open_count > 0).length;
  const reached = households.filter((h) => h.sent_at || h.open_count > 0).length;
  const notSent = n - reached;
  const pct = n ? Math.round((opened / n) * 100) : 0;
  const next = events.find((e) => (e.event_date as string) >= today);
  const days = w ? daysUntil(w.main_date) : 0;
  const nudges = households.filter((h) => h.open_count === 0).sort((a, b) => Number(Boolean(b.sent_at)) - Number(Boolean(a.sent_at))).slice(0, 4);
  const items = cl ?? [];
  const itemsDone = items.filter((i) => i.status === "done").length;
  const overdue = items.filter((i) => i.status !== "done" && i.due_date && i.due_date < today).length;
  const booked = (xs ?? []).reduce((s, x) => s + Number(x.total_amount), 0);
  const paid = (xs ?? []).reduce((s, x) => s + Number(x.paid_amount), 0);

  const kpis = [
    { label: "Households invited", value: n, sub: `${groom} groom · ${bride} bride side` },
    { label: "Opened their link", value: opened, sub: `${pct}% of invites` },
    { label: "Not sent yet", value: notSent, sub: notSent ? "waiting on WhatsApp" : "everyone has it" },
    { label: "People invited", value: people, sub: "max guests, all families" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <section className="relative flex min-h-[230px] items-center overflow-hidden rounded-[26px] bg-[#FBF3E3]">
        <Image src="/images/dash-garland.jpg" alt="" fill priority sizes="(max-width: 1024px) 100vw, 1080px" className="object-cover object-top" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,243,227,0)_25%,rgba(251,243,227,.85)_70%)]" />
        <div className="relative flex w-full flex-wrap items-end justify-between gap-6 px-6 pb-8 pt-28 sm:px-10">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[#6B4E2E]">Namaste, {member.name.split(" ")[0]}</span>
            <h1 className="font-display text-5xl font-semibold leading-none text-maroon sm:text-[56px]">{days} {days === 1 ? "day" : "days"} to go</h1>
            {next && <span className="text-sm text-[#6B4E2E]">{next.name} on {formatAd(next.event_date)} · {next.date_bs}{next.starts_at ? ` · ${formatTime(String(next.starts_at).slice(0, 5))}` : ""}</span>}
            {w && <span className="text-sm text-[#6B4E2E]">Main day {w.main_date_bs}</span>}
          </div>
          <div className="flex items-center gap-4 rounded-[18px] bg-[rgba(255,251,243,.92)] px-5 py-4">
            <div aria-hidden className="flex size-16 items-center justify-center rounded-full" style={{ background: `conic-gradient(#8E1B1B 0 ${pct}%, #EADBC0 ${pct}% 100%)` }}>
              <div className="flex size-12 items-center justify-center rounded-full bg-[#FFFBF3] text-[15px] font-bold text-maroon">{pct}%</div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-bold">{opened} of {n} opened</span>
              <span className="text-[13px] text-[#6B5444]">{reached} sent · {notSent} not sent</span>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section aria-label="Key numbers" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className={`${card} flex flex-col gap-2 p-5`}>
            <span className="text-[13px] text-[#6B5444]">{k.label}</span>
            <span className="font-display text-[46px] font-semibold leading-none text-maroon">{k.value}</span>
            <span className="text-[13px] text-[#8A6A3B]">{k.sub}</span>
          </div>
        ))}
      </section>

      {/* Ceremonies */}
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-[30px] font-semibold text-maroon">Families invited per ceremony</h2>
          <Link href="/admin/matrix" className="text-sm font-semibold text-sindoor hover:text-[#5E0F12]">Edit who&apos;s invited →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => {
            const count = households.filter((h) => h.invitations.some((i) => i.event_id === e.id)).length;
            const share = n ? Math.round((count / n) * 100) : 0;
            const ppl = households.filter((h) => h.invitations.some((i) => i.event_id === e.id)).reduce((s, h) => s + h.max_guests, 0);
            return (
              <Link key={e.id} href="/admin/ceremonies" className={`${card} flex flex-col overflow-hidden no-underline hover:border-gold`}>
                <div className="relative h-32">
                  {e.image_path && <Image src={e.image_path} alt="" fill sizes="360px" className="object-cover" />}
                  <span className="absolute left-3.5 top-3 rounded-full bg-[rgba(255,251,243,.92)] px-2.5 py-1.5 text-xs font-semibold text-maroon">{formatAd(e.event_date)} · {e.date_bs}</span>
                </div>
                <div className="flex flex-col gap-3 p-[18px]">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-[26px] font-semibold text-ink">{e.name}</h3>
                    <span className="font-display text-[34px] font-semibold text-sindoor">{count}</span>
                  </div>
                  <div aria-hidden className="h-2 overflow-hidden rounded-full bg-[#EADBC0]"><div className="h-full rounded-full bg-gold" style={{ width: `${share}%` }} /></div>
                  <div className="flex justify-between text-[13px] text-[#6B5444]"><span>families · up to {ppl} people</span><span>{share}% of list</span></div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Nudges + checklist */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className={`${card} flex flex-col gap-4 p-6`}>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[26px] font-semibold text-maroon">Needs a nudge</h2>
            <span className="text-[13px] text-[#6B5444]">{n - opened} haven&apos;t opened</span>
          </div>
          {nudges.length === 0 ? <p className="text-sm text-[#6B5444]">Everyone has opened their invitation. 🎉</p> : nudges.map((h, i) => (
            <div key={h.id} className="flex items-center gap-3 border-t border-[#F0E4CC] py-2.5">
              <div aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-[#FFF7E8]" style={{ background: AVATAR[i % AVATAR.length] }}>{initials(h.display_name)}</div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[15px] font-semibold">{h.display_name}</span>
                <span className="text-xs text-[#6B5444]">{SIDE[h.side]} · {h.sent_at ? `sent ${formatAd(String(h.sent_at).slice(0, 10))}` : "not sent yet"}</span>
              </div>
              <Link href="/admin/send" className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#25B566] px-3.5 text-[13px] font-semibold text-white no-underline hover:bg-[#1E9E57]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1 1 21 11.5z" /></svg>
                {h.sent_at ? "Resend" : "Send"}
              </Link>
            </div>
          ))}
        </div>
        <div className={`${card} flex flex-col gap-4 p-6`}>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[26px] font-semibold text-maroon">Checklists</h2>
            <Link href="/admin/checklists" className="text-sm font-semibold text-sindoor hover:text-[#5E0F12]">Open →</Link>
          </div>
          <div className="flex items-end gap-3">
            <span className="font-display text-[46px] font-semibold leading-none text-maroon">{itemsDone}<span className="text-2xl text-[#8A7666]">/{items.length}</span></span>
            <span className="pb-1 text-sm text-[#6B5444]">items done</span>
          </div>
          <div aria-hidden className="h-2 overflow-hidden rounded-full bg-[#EADBC0]"><div className="h-full rounded-full bg-gold" style={{ width: `${items.length ? Math.round((itemsDone / items.length) * 100) : 0}%` }} /></div>
          <p className={`text-sm ${overdue ? "font-semibold text-sindoor" : "text-[#6B5444]"}`}>{items.length === 0 ? "Open a ceremony and add its starter list." : overdue ? `${overdue} overdue: check “Overdue”` : "Nothing overdue."}</p>
          <div className="mt-auto flex flex-wrap gap-2 border-t border-[#F0E4CC] pt-4">
            <span className="w-full text-xs font-semibold uppercase tracking-wide text-[#8A6A3B]">Download for Excel</span>
            {[["guests", "Guest list"], ["checklist", "Checklists"], ["expenses", "Expenses"]].map(([k, l]) => (
              <a key={k} href={`/admin/export/${k}`} className="rounded-full border border-[#E2CFAB] px-3.5 py-2 text-[13px] font-semibold text-maroon no-underline hover:border-gold hover:bg-[#FFF4DC]">⬇ {l}</a>
            ))}
          </div>
        </div>
      </section>

      {/* Money */}
      <section className="grid grid-cols-2 gap-4 rounded-[22px] bg-maroon p-6 text-[#FFF7E8] sm:grid-cols-4 sm:items-center">
        <div className="flex flex-col gap-1"><span className="text-[13px] text-[#D9BE86]">Committed</span><span className="font-display text-3xl font-semibold sm:text-4xl">{npr(booked)}</span></div>
        <div className="flex flex-col gap-1"><span className="text-[13px] text-[#D9BE86]">Paid so far</span><span className="font-display text-3xl font-semibold sm:text-4xl">{npr(paid)}</span></div>
        <div className="flex flex-col gap-1"><span className="text-[13px] text-[#D9BE86]">Balance due</span><span className="font-display text-3xl font-semibold text-[#F3C66B] sm:text-4xl">{npr(booked - paid)}</span></div>
        <Link href="/admin/expenses" className="justify-self-start rounded-full bg-gold px-5 py-3.5 text-sm font-semibold text-maroon no-underline hover:bg-gold-hover sm:justify-self-end">Open ledger</Link>
      </section>
    </div>
  );
}
