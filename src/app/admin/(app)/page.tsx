import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { daysUntil, formatAd, formatAdLong, formatTime } from "@/lib/format";
import { npr } from "@/lib/money";
import { createAuthClient, getMembership } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Wedding admin" };

const TILES = [
  { title: "Guests", body: "Families & who's invited", href: "/admin/guests", img: "/images/hands.jpg" },
  { title: "Send invites", body: "WhatsApp, sent & opened", href: "/admin/send", img: "/images/diyas.jpg" },
  { title: "Ceremonies", body: "Dates, venues, colours", href: "/admin/ceremonies", img: "/images/tilak-matkor.jpg" },
  { title: "Who's invited where", body: "Families × ceremonies", href: "/admin/matrix", img: "/images/mehendi.jpg" },
  { title: "Checklists", body: "Samagri, bookings, to-dos", href: "/admin/checklists", img: "/images/haldi.jpg" },
  { title: "Expenses", body: "Booked, paid, still due", href: "/admin/expenses", img: "/images/reception.jpg" },
];

type H = { side: string; max_guests: number; sent_at: string | null; open_count: number };

export default async function AdminHome() {
  const { member } = await getMembership();
  if (!member) return null;
  const sb = await createAuthClient();
  const today = new Date(Date.now() + (5 * 60 + 45) * 60_000).toISOString().slice(0, 10); // Nepal date
  const [{ data: w }, { data: hs }, { data: next }, { data: cl }, { data: xs }] = await Promise.all([
    sb.from("weddings").select("title, main_date, main_date_bs").eq("id", member.weddingId).single(),
    sb.from("households").select("side, max_guests, sent_at, open_count").eq("wedding_id", member.weddingId),
    sb.from("events").select("name, subtitle, event_date, date_bs, starts_at, venue_name, venue_city, image_path")
      .eq("wedding_id", member.weddingId).gte("event_date", today).order("event_date").order("starts_at").limit(1).maybeSingle(),
    sb.from("checklist_items").select("status, due_date").eq("wedding_id", member.weddingId),
    sb.from("expenses").select("total_amount, paid_amount").eq("wedding_id", member.weddingId),
  ]);
  const items = cl ?? [];
  const itemsDone = items.filter((i) => i.status === "done").length;
  const overdue = items.filter((i) => i.status !== "done" && i.due_date && i.due_date < today).length;
  const booked = (xs ?? []).reduce((n, x) => n + Number(x.total_amount), 0);
  const due = (xs ?? []).reduce((n, x) => n + Number(x.total_amount) - Number(x.paid_amount), 0);

  const households = (hs as H[] | null) ?? [];
  const families = households.length;
  const people = households.reduce((n, h) => n + h.max_guests, 0);
  const side = (s: string) => {
    const list = households.filter((h) => h.side === s);
    return { families: list.length, people: list.reduce((n, h) => n + h.max_guests, 0) };
  };
  const sides = [
    { label: "Groom side", ...side("groom"), color: "bg-sindoor" },
    { label: "Bride side", ...side("bride"), color: "bg-marigold" },
    { label: "Both / friends", ...side("common"), color: "bg-gold" },
  ];
  const sent = households.filter((h) => h.sent_at || h.open_count).length;
  const opened = households.filter((h) => h.open_count > 0).length;
  const pct = (n: number) => (families ? Math.round((n / families) * 100) : 0);
  const days = w ? daysUntil(w.main_date) : 0;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-night text-ivory">
        <Image src="/images/kohbar.jpg" alt="" fill priority sizes="(max-width: 768px) 100vw, 720px" className="object-cover object-[center_35%] opacity-60" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,11,16,.92)_0%,rgba(27,11,16,.6)_55%,rgba(27,11,16,.15)_100%)]" />
        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <p lang="sa" className="font-deva text-sm text-gold-light">॥ श्री गणेशाय नमः ॥</p>
            <p className="mt-3 text-xs uppercase tracking-[.25em] text-gold-light/80">Namaste, {member.name.split(" ")[0]}</p>
            <h1 className="mt-1 font-display text-4xl sm:text-5xl">{w?.title ?? member.weddingTitle}</h1>
            {w && <p className="mt-1 text-ivory/80">{w.main_date_bs} · {formatAdLong(w.main_date)}</p>}
          </div>
          <div className="shrink-0 rounded-2xl border border-gold/40 bg-night/50 px-5 py-3 text-center backdrop-blur">
            <p className="font-display text-5xl leading-none text-gold-light">{days}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-ivory/70">{days === 1 ? "day to go" : "days to go"}</p>
          </div>
        </div>
      </section>

      {/* Family count */}
      <section>
        <h2 className="mb-3 font-display text-2xl text-maroon">Family count</h2>
        <div className="grid gap-3 sm:grid-cols-[1.1fr_2fr]">
          <div className="rounded-2xl border border-sand bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Families invited</p>
            <p className="mt-1 font-display text-5xl text-maroon">{families}</p>
            <p className="text-sm text-quiet">up to <b className="text-ink">{people}</b> people</p>
          </div>
          <div className="rounded-2xl border border-sand bg-white p-5">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-cream">
              {sides.map((s) => <div key={s.label} className={s.color} style={{ width: `${families ? (s.families / families) * 100 : 0}%` }} />)}
            </div>
            <ul className="mt-4 grid grid-cols-3 gap-2">
              {sides.map((s) => (
                <li key={s.label}>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-muted"><span className={`size-2 rounded-full ${s.color}`} />{s.label}</span>
                  <span className="font-display text-3xl text-ink">{s.families}</span>
                  <span className="block text-xs text-quiet">{s.people} people</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Invitations */}
      <section className="rounded-2xl border border-sand bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-maroon">Invitations</h2>
          <Link href="/admin/send" className="text-sm font-semibold text-sindoor">Send →</Link>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {[
            { n: families - sent, label: "Not sent yet", tone: "text-quiet" },
            { n: sent, label: "Sent", tone: "text-ink" },
            { n: opened, label: "Opened", tone: "text-[#2f5d3a]" },
          ].map((k) => (
            <div key={k.label} className="rounded-xl bg-ivory py-3">
              <p className={`font-display text-4xl ${k.tone}`}>{k.n}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{k.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-cream">
          <div className="h-full bg-[#2f5d3a]" style={{ width: `${pct(opened)}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-quiet">{pct(opened)}% of families have opened their invitation</p>
      </section>

      {/* Next ceremony */}
      {next && (
        <Link href="/admin/ceremonies" className="group flex overflow-hidden rounded-2xl border border-sand bg-white transition hover:border-gold">
          <div className="relative w-32 shrink-0 sm:w-44">
            {next.image_path && <Image src={next.image_path} alt="" fill sizes="176px" className="object-cover transition group-hover:scale-105" />}
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-marigold">Next ceremony</p>
            <h2 className="font-display text-3xl text-maroon">{next.name} <span className="font-deva text-base text-quiet">{next.subtitle}</span></h2>
            <p className="text-sm text-muted">{next.date_bs} · {formatAd(next.event_date)}{next.starts_at && ` · ${formatTime(next.starts_at.slice(0, 5))}`}</p>
            <p className="text-sm text-quiet">{[next.venue_name, next.venue_city].filter(Boolean).join(", ") || "Venue not set"}</p>
          </div>
        </Link>
      )}

      {/* Checklist + money */}
      <section className="grid grid-cols-2 gap-3">
        <Link href="/admin/checklists" className="rounded-2xl border border-sand bg-white p-5 hover:border-gold">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Checklists</p>
          <p className="mt-1 font-display text-4xl text-maroon">{itemsDone}<span className="text-2xl text-quiet">/{items.length}</span></p>
          <p className={`text-sm ${overdue ? "font-semibold text-sindoor" : "text-quiet"}`}>{items.length === 0 ? "Add starter lists" : overdue ? `${overdue} overdue` : "items done"}</p>
        </Link>
        <Link href="/admin/expenses" className="rounded-2xl border border-sand bg-white p-5 hover:border-gold">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Still to pay</p>
          <p className="mt-1 font-display text-3xl text-sindoor sm:text-4xl">{npr(due)}</p>
          <p className="text-sm text-quiet">of {npr(booked)} booked</p>
        </Link>
      </section>

      {/* Shortcuts */}
      <section className="grid grid-cols-2 gap-3">
        {TILES.map((t) => (
          <Link key={t.href} href={t.href} className="group relative h-36 overflow-hidden rounded-2xl bg-night sm:h-44">
            <Image src={t.img} alt="" fill sizes="(max-width: 768px) 50vw, 360px" className="object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-90" />
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,11,16,0)_30%,rgba(27,11,16,.9)_100%)]" />
            <div className="absolute inset-x-4 bottom-3">
              <h3 className="font-display text-2xl text-ivory">{t.title}</h3>
              <p className="text-xs text-ivory/75">{t.body}</p>
            </div>
          </Link>
        ))}
      </section>
      <section className="rounded-2xl border border-sand bg-white p-5">
        <h2 className="font-display text-2xl text-maroon">Download for Excel</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[["guests", "Guest list"], ["checklist", "Checklists"], ["expenses", "Expenses"]].map(([k, l]) => (
            <a key={k} href={`/admin/export/${k}`} className="rounded-full border border-sand px-4 py-2 text-sm font-semibold text-ink hover:border-gold">⬇ {l} (.csv)</a>
          ))}
        </div>
      </section>
      <p className="text-center text-sm text-quiet">
        <Link href="/admin/members" className="font-semibold text-muted hover:text-sindoor">Family who can sign in →</Link>
      </p>
    </div>
  );
}
