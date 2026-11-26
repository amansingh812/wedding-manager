import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ClosingBlessing from "@/components/invite/ClosingBlessing";
import Countdown from "@/components/home/Countdown";
import { getStore } from "@/lib/data/store";
import { seedHouseholds } from "@/lib/data/seed";
import { daysUntil, formatAd, formatAdLong, formatTime } from "@/lib/format";

// Read data + SHOW_DEMO_LINKS at request time (Cloudflare runtime), not at build.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getStore().getPublicSite().catch(() => null);
  if (!site) return { title: "Wedding" };
  const { wedding: w } = site;
  return {
    title: `${w.title} · ${w.mainDateBs}`,
    description: `${w.title} — ${w.mainDateBs} · ${formatAdLong(w.mainDate)}`,
    openGraph: { title: w.title, description: `${w.mainDateBs} · ${formatAdLong(w.mainDate)}`, images: [{ url: "/images/og.jpg", width: 1200, height: 630 }] },
  };
}

export default async function Home() {
  const site = await getStore().getPublicSite().catch(() => null);
  const showDemo = process.env.NODE_ENV !== "production" || process.env.SHOW_DEMO_LINKS === "1";

  if (!site) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-ivory p-8 text-center">
        <div>
          <p lang="sa" className="font-deva text-2xl text-sindoor">॥ श्री गणेशाय नमः ॥</p>
          <h1 className="mt-3 font-display text-4xl text-maroon">Our wedding site is on its way</h1>
        </div>
      </main>
    );
  }
  const { wedding: w, ceremonies, home } = site;
  const cities = [home.groomFrom, home.brideFrom].filter(Boolean).join(" · ");

  return (
    <main className="bg-ivory text-ink">
      {/* 1 · Shree Ganesh hero */}
      <section className="relative flex min-h-svh flex-col items-center justify-between overflow-hidden bg-night px-6 pb-10 pt-8 text-center text-ivory">
        <Image src="/images/ganesh-courtyard.jpg" alt="Lord Ganesh in a temple courtyard with marigolds and diyas" fill priority sizes="100vw" className="object-cover object-[center_30%]" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,11,16,.75)_0%,rgba(27,11,16,.15)_30%,rgba(27,11,16,.35)_55%,rgba(27,11,16,.95)_100%)]" />
        <p lang="sa" className="relative font-deva text-2xl text-gold-light drop-shadow sm:text-3xl">॥ श्री गणेशाय नमः ॥</p>
        <div className="relative w-full max-w-xl">
          <p className="text-xs uppercase tracking-[.35em] text-gold-light/90">Together with their families</p>
          <h1 className="mt-3 font-display text-6xl leading-none sm:text-7xl">
            {w.groomName} <span className="text-gold">&amp;</span> {w.brideName}
          </h1>
          {home.nickname && <p className="mt-2 font-display text-xl italic text-gold-light">{home.nickname}</p>}
          <p className="mt-4 font-semibold uppercase tracking-[.2em] text-ivory/90">{w.mainDateBs} · {formatAdLong(w.mainDate)}</p>
          {cities && <p className="mt-1 text-sm text-ivory/70">{cities}</p>}
          <div className="mt-7"><Countdown dateIso={w.mainDate} initialDays={daysUntil(w.mainDate)} /></div>
          <a href="#ceremonies" className="mt-8 inline-block rounded-full bg-gold px-7 py-3 font-semibold text-night shadow-lg transition hover:bg-gold-hover">See the celebrations ↓</a>
        </div>
      </section>

      {/* 2 · Welcome */}
      {home.welcome && (
        <section className="mx-auto max-w-2xl px-6 py-16 text-center">
          <Image src="/images/kalash.webp" alt="" width={72} height={72} className="mx-auto" />
          <p className="mt-5 font-display text-2xl leading-relaxed text-maroon sm:text-3xl">{home.welcome}</p>
        </section>
      )}

      {/* 3 · Two families, two traditions */}
      {(home.groomTradition || home.brideTradition) && (
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="text-center font-display text-4xl text-maroon">Two families, two traditions</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {[
              { name: w.groomName, role: "The groom", tradition: home.groomTradition, from: home.groomFrom, note: home.groomNote, img: "/images/kohbar.jpg", pos: "object-[center_30%]" },
              { name: w.brideName, role: "The bride", tradition: home.brideTradition, from: home.brideFrom, note: home.brideNote, img: "/images/courtyard.jpg", pos: "object-center" },
            ].map((f) => (
              <article key={f.role} className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-sand">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={f.img} alt="" fill sizes="(max-width: 640px) 100vw, 480px" className={`object-cover ${f.pos} transition duration-700 group-hover:scale-105`} />
                  <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,11,16,0)_45%,rgba(27,11,16,.85)_100%)]" />
                  <div className="absolute inset-x-5 bottom-4 text-ivory">
                    <p className="text-xs uppercase tracking-[.25em] text-gold-light">{f.role}{f.tradition && ` · ${f.tradition}`}</p>
                    <h3 className="font-display text-4xl">{f.name}</h3>
                  </div>
                </div>
                <div className="p-5">
                  {f.from && <p className="text-sm font-semibold text-muted">📍 {f.from}</p>}
                  {f.note && <p className="mt-1 text-[15px] leading-relaxed text-quiet">{f.note}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 4 · Ceremonies */}
      <section id="ceremonies" className="scroll-mt-4 bg-[linear-gradient(180deg,#3a0a0c,#1b0b10)] px-6 py-16 text-ivory">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-xs uppercase tracking-[.35em] text-gold-light">विवाह उत्सव</p>
          <h2 className="mt-2 text-center font-display text-4xl">The celebrations</h2>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ceremonies.map((c) => (
              <li key={c.id} className="overflow-hidden rounded-3xl bg-ivory text-ink shadow-xl">
                <div className="relative aspect-[5/4]">
                  {c.imagePath && <Image src={c.imagePath} alt="" fill sizes="(max-width: 640px) 100vw, 360px" className="object-cover" />}
                  <div className="absolute left-3 top-3 rounded-xl bg-ivory/95 px-3 py-1.5 text-center shadow">
                    <p className="text-xs font-bold uppercase tracking-wide text-sindoor">{c.dateBs}</p>
                    <p className="text-[11px] text-muted">{formatAd(c.eventDate)}</p>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-3xl text-maroon">{c.name} {c.subtitle && <span className="font-deva text-base text-quiet">{c.subtitle}</span>}</h3>
                  <p className="mt-1 text-sm text-muted">{[c.startsAt && formatTime(c.startsAt), c.venueCity].filter(Boolean).join(" · ")}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-10 max-w-md text-center text-sm text-ivory/75">
            Venues, maps and timings are in your personal invitation. If you received one on WhatsApp, please open that link.
          </p>
        </div>
      </section>

      {/* 5 · Blessing */}
      <section className="px-6 py-16"><div className="mx-auto max-w-md"><ClosingBlessing /></div></section>

      {/* 6 · Footer */}
      <footer className="border-t border-sand px-6 py-10 text-center">
        <p className="font-display text-3xl text-maroon">{w.title}</p>
        <p className="mt-1 text-sm text-muted">{w.mainDateBs} · {formatAdLong(w.mainDate)}</p>
        {w.hashtag && <p className="mt-3 font-semibold text-sindoor">{w.hashtag}</p>}
        <Link href="/admin/login" className="mt-6 inline-block text-xs text-quiet underline-offset-4 hover:underline">Family sign in</Link>
        {showDemo && (
          <nav aria-label="Demo invitations" className="mx-auto mt-6 flex max-w-sm flex-col gap-1.5 rounded-2xl border border-dashed border-sand p-4 text-left text-sm">
            <span className="text-xs font-semibold uppercase tracking-[2px] text-quiet">Demo invitations (test only)</span>
            {seedHouseholds.map((h) => <Link key={h.slug} href={`/invite/${h.slug}`} className="text-sindoor hover:underline">{h.displayName}</Link>)}
          </nav>
        )}
      </footer>
    </main>
  );
}
