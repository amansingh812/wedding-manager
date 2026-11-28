import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Countdown from "@/components/home/Countdown";
import { getStore } from "@/lib/data/store";
import { seedHouseholds } from "@/lib/data/seed";
import { daysUntil, formatAd, formatAdLong } from "@/lib/format";
import type { PublicCeremony } from "@/lib/types";

// Read data at request time (Cloudflare runtime), not at build.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getStore().getPublicSite().catch(() => null);
  if (!site) return { title: "Wedding" };
  const { wedding: w } = site;
  const desc = `${w.mainDateBs} · ${formatAdLong(w.mainDate)}`;
  return { title: `${w.title} · Wedding`, description: desc, openGraph: { title: w.title, description: desc, images: [{ url: "/images/og.jpg", width: 1200, height: 630 }] } };
}

/** "Venue, City" — without repeating the city if the venue name already has it. */
const place = (c: PublicCeremony) =>
  c.venueName && c.venueCity && c.venueName.includes(c.venueCity) ? c.venueName : [c.venueName, c.venueCity].filter(Boolean).join(", ");
const shortAd = (iso: string) => formatAd(iso).replace(/^\w+, /, ""); // "Sat, 27 Feb" → "27 Feb"
const PETALS = [
  { left: "12%", size: 22, dur: 14, delay: -2 },
  { left: "34%", size: 16, dur: 18, delay: -9 },
  { left: "58%", size: 22, dur: 16, delay: -5 },
  { left: "82%", size: 18, dur: 20, delay: -12 },
];

export default async function Home() {
  const site = await getStore().getPublicSite().catch(() => null);
  const showDemo = process.env.NODE_ENV !== "production"; // demo invite links: local development only

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
  const initials = `${w.groomName[0] ?? ""} ✦ ${w.brideName[0] ?? ""}`;
  const places = [home.groomFrom, home.brideFrom].filter(Boolean).join(" & ");
  const venues = ["bibah", "reception"].map((k) => ceremonies.find((c) => c.kind === k)).filter((c): c is PublicCeremony => Boolean(c));
  const [mainVenue, ...otherVenues] = venues;
  const nav = [["#story", "Story"], ["#ceremonies", "Ceremonies"], ["#venue", "Venue"]];

  return (
    <main id="top" className="bg-ivory font-sans text-ink">
      {/* 1 · Hero */}
      <header className="relative min-h-[720px] overflow-hidden bg-night sm:h-[880px]">
        <video
          className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
          src="/video/home-hero.mp4" poster="/images/home-hero.jpg"
          autoPlay muted loop playsInline preload="metadata"
          aria-label="Mithila-painted wall beside a marigold-draped Nepali mandap at dusk"
        />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,8,14,.85)_0%,rgba(20,8,14,.5)_45%,rgba(20,8,14,.05)_75%)] max-sm:bg-[linear-gradient(180deg,rgba(20,8,14,.55)_0%,rgba(20,8,14,.35)_40%,rgba(20,8,14,.85)_100%)]" />
        {PETALS.map((p, i) => (
          <Image key={i} src="/images/marigold.webp" alt="" aria-hidden width={p.size} height={p.size} className="petal opacity-85 motion-reduce:hidden" style={{ left: p.left, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
        ))}

        <nav className="relative mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-6 py-7 sm:px-8">
          <a href="#top" className="font-display text-[30px] tracking-[2px] text-gold-light no-underline">
            {initials.split("✦")[0]}<span className="text-marigold">✦</span>{initials.split("✦")[1]}
          </a>
          <div className="flex flex-wrap items-center gap-5 sm:gap-7">
            {nav.map(([href, label]) => (
              <a key={href} href={href} className="hidden text-sm uppercase tracking-[1.5px] text-cream no-underline hover:text-gold-light sm:inline">{label}</a>
            ))}
            <Link href="/admin/login" className="text-[13px] uppercase tracking-[1.5px] text-cream no-underline hover:text-gold-light sm:text-sm">Login</Link>
          </div>
        </nav>

        <div className="relative mx-auto flex max-w-[1280px] flex-col items-start gap-5 px-6 pb-16 pt-16 sm:px-8 sm:pt-[110px]">
          <p lang="ne" className="font-deva text-[22px] text-gold-light">शुभ विवाह</p>
          <h1 className="font-display text-[clamp(64px,9vw,136px)] font-medium leading-[.92] text-[#FFF7E8]">
            {w.groomName}
            <br />
            <span className="text-[.6em] italic text-[#E8B04A]">&amp;</span> {w.brideName}
          </h1>
          {home.nickname && <p className="font-display text-2xl italic text-gold-light">“{home.nickname}”</p>}
          <p className="text-sm uppercase tracking-[3px] text-cream sm:text-base">
            {w.mainDateBs} &nbsp;·&nbsp; {formatAdLong(w.mainDate)}{places && <> &nbsp;·&nbsp; {places}</>}
          </p>
          <div className="mt-3"><Countdown dateIso={w.mainDate} initialDays={daysUntil(w.mainDate)} /></div>
        </div>
      </header>

      {/* 2 · Blessing line */}
      <section className="mx-auto flex max-w-[760px] flex-col items-center gap-5 px-8 pb-[72px] pt-24 text-center">
        <Image src="/images/kalash.webp" alt="Golden kalash emblem" width={112} height={112} />
        <p className="font-display text-[28px] leading-[1.3] text-[#5E0F12] sm:text-[34px]">{home.blessing ?? "With the blessings of our elders, two families come together."}</p>
        {w.hashtag && <p className="text-sm uppercase tracking-[3px] text-[#8A6A3B]">{w.hashtag}</p>}
      </section>

      {/* 3 · Story */}
      <section id="story" className="mx-auto grid max-w-[1280px] scroll-mt-4 items-end gap-6 px-6 pb-28 sm:grid-cols-3 sm:px-8">
        {[
          { src: "/images/story-chiya.jpg", alt: "Two glasses of chiya on a rooftop at sunrise", cap: "It started over chiya.", arch: true },
          { src: "/images/hands.jpg", alt: "Bride's hands with mehendi holding a sindoor box", cap: "Then came the yes.", arch: false },
          { src: "/images/story-paag.jpg", alt: "Mithila paag and a red Nepali bridal sari linked by a marigold mala", cap: "Now, forever.", arch: true },
        ].map((f) => (
          <figure key={f.cap} className="flex flex-col gap-3.5">
            <div className={`relative aspect-[4/5] overflow-hidden ${f.arch ? "rounded-[220px_220px_20px_20px]" : "rounded-[20px]"}`}>
              <Image src={f.src} alt={f.alt} fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover" />
            </div>
            <figcaption className="font-display text-[22px] text-[#5E0F12]">{f.cap}</figcaption>
          </figure>
        ))}
      </section>

      {/* 4 · Two families */}
      <section aria-label="Two cultures" className="grid sm:grid-cols-2">
        {[
          { img: "/images/kohbar.jpg", alt: "Mithila kohbar wall painting with lotus, bamboo and fish", label: ["Groom", home.groomTradition, home.groomFrom], name: home.groomFamily ?? w.groomName },
          { img: "/images/hands.jpg", alt: "Nepali bride's hands with mehendi, pote and gold bangles", label: ["Bride", home.brideTradition, home.brideFrom], name: home.brideFamily ?? w.brideName },
        ].map((f) => (
          <div key={f.img} className="relative min-h-[420px] overflow-hidden sm:min-h-[560px]">
            <Image src={f.img} alt={f.alt} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,6,8,0)_50%,rgba(20,6,8,.82)_100%)]" />
            <div className="absolute inset-x-9 bottom-8 flex flex-col gap-1.5 text-[#FFF7E8]">
              <span className="text-xs uppercase tracking-[2.5px] text-gold-light">{f.label.filter(Boolean).join(" · ")}</span>
              <span className="font-display text-[44px] font-medium leading-none">{f.name}</span>
            </div>
          </div>
        ))}
      </section>
      <div aria-hidden className="h-24 bg-[url('/images/mithila-border.jpg')] bg-[length:auto_100%] bg-center bg-repeat-x" />

      {/* 5 · Ceremonies */}
      <section id="ceremonies" className="scroll-mt-0 bg-maroon py-[104px]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-11 px-6 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-[44px] font-medium leading-tight text-[#FFF7E8] sm:text-[60px]">Two cultures, one celebration</h2>
            <Image src="/images/fish.webp" alt="Mithila fish-pair emblem" width={72} height={72} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ceremonies.map((c) => (
              <article key={c.id} className="group relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[#2A0709]">
                {c.imagePath && <Image src={c.imagePath} alt="" fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover transition-transform duration-[800ms] group-hover:scale-105" />}
                <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,6,8,0)_45%,rgba(20,6,8,.85)_100%)]" />
                <div className="absolute inset-x-6 bottom-5 flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-[2.5px] text-gold-light">{c.dateBs} · {shortAd(c.eventDate)}</span>
                  {c.venueCity && <span className="text-[13px] text-[#EBD9B6]">{c.venueCity}</span>}
                  <h3 className="font-display text-4xl font-medium text-[#FFF7E8]">{c.name}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · Venue */}
      {mainVenue && (
        <section id="venue" className="relative flex min-h-[640px] scroll-mt-0 items-end overflow-hidden">
          <Image src="/images/venue-garden.jpg" alt="Party palace garden lit with lanterns and marigold arches" fill sizes="100vw" className="object-cover" />
          <div className="relative mx-auto box-border w-full max-w-[1280px] px-6 pb-14 sm:px-8">
            <div className="flex max-w-[440px] flex-col gap-3 rounded-3xl bg-[rgba(251,246,236,.95)] p-8">
              <span className="text-xs uppercase tracking-[2.5px] text-[#8A6A3B]">{mainVenue.name} · {mainVenue.dateBs} · {shortAd(mainVenue.eventDate)}</span>
              <h2 className="font-display text-[34px] font-medium leading-tight text-maroon sm:text-[40px]">{place(mainVenue)}</h2>
              {otherVenues.map((v) => (
                <p key={v.id} className="text-[15px] text-[#5A4636]">{v.name} · {v.dateBs} · {place(v)}</p>
              ))}
              {venues.filter((v) => v.mapUrl).map((v) => (
                <a key={v.id} href={v.mapUrl!} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2.5 self-start rounded-full bg-gold px-5 py-3.5 text-[15px] font-semibold text-[#2A0709] no-underline hover:bg-gold-hover">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>
                  {venues.filter((x) => x.mapUrl).length > 1 ? `${v.name} on Google Maps` : "Open in Google Maps"}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7 · Personal invitation */}
      <section className="mx-auto grid max-w-[1280px] items-center gap-10 px-6 py-24 sm:grid-cols-[1fr_1.1fr] sm:gap-16 sm:px-8">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[220px_220px_24px_24px] shadow-xl sm:max-h-[560px]">
          <Image src="/images/diyas-steps.jpg" alt="Lit diyas on temple steps" fill sizes="(max-width: 640px) 100vw, 560px" className="object-cover object-[center_70%]" />
        </div>
        <div className="flex flex-col gap-5">
          <p className="text-xs uppercase tracking-[3px] text-[#8A6A3B]">For our guests</p>
          <h2 className="font-display text-[40px] font-medium leading-[1.08] text-maroon sm:text-[48px]">Your invitation is personal.</h2>
          <p className="max-w-md text-[17px] leading-relaxed text-[#5A4636]">Open the link we sent you on WhatsApp to see your ceremonies, venues and timings for your family.</p>
          {showDemo && (
            <nav aria-label="Demo invitations" className="mt-2 flex max-w-sm flex-col gap-1.5 rounded-2xl border border-dashed border-sand bg-white/60 p-4 text-sm">
              <span className="text-[11px] font-semibold uppercase tracking-[2px] text-quiet">Demo invitations (test only)</span>
              {seedHouseholds.map((h) => <Link key={h.slug} href={`/invite/${h.slug}`} className="text-sindoor hover:underline">{h.displayName}</Link>)}
            </nav>
          )}
        </div>
      </section>
      <div aria-hidden className="h-16 bg-[url('/images/mithila-border.jpg')] bg-[length:auto_100%] bg-center bg-repeat-x" />

      {/* 8 · Footer */}
      <footer className="relative flex h-[420px] items-end overflow-hidden">
        <Image src="/images/footer-terai.jpg" alt="Mustard fields and a river in the Terai at sunset" fill sizes="100vw" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,8,14,0)_30%,rgba(20,8,14,.8)_100%)]" />
        <div className="relative mx-auto box-border flex w-full max-w-[1280px] flex-wrap items-end justify-between gap-4 px-6 pb-10 sm:px-8">
          <div>
            <p className="font-display text-[44px] text-[#FFF7E8]">{w.groomName} <span className="italic text-[#E8B04A]">&amp;</span> {w.brideName}</p>
            {home.nickname && <p className="font-display text-xl italic text-gold-light">{home.nickname}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="text-[13px] uppercase tracking-[2.5px] text-gold-light">{[home.groomFrom && home.brideFrom ? `${home.groomFrom} → ${home.brideFrom}` : null, w.hashtag].filter(Boolean).join(" · ")}</p>
            <Link href="/admin/login" className="text-xs text-cream/80 underline-offset-4 hover:text-cream hover:underline">Family login →</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
