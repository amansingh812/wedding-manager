import Image from "next/image";
import Link from "next/link";
import { seedHouseholds } from "@/lib/data/seed";

/**
 * Placeholder until the full public home page is built (Phase 5).
 * Opens with Shree Ganesh, as every auspicious beginning does.
 * In development it lists the demo invitation links for testing.
 */
export default function Home() {
  const isDev = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_DEMO_LINKS === "1";
  return (
    <main className="mx-auto min-h-svh max-w-[480px] bg-ivory">
      <section aria-label="Shree Ganesh" className="relative h-[62svh] min-h-[460px] overflow-hidden bg-night">
        <Image
          src="/images/ganesh-idol.jpg"
          alt="Brass idol of Lord Ganesh with marigolds and diyas"
          fill
          priority
          sizes="480px"
          className="object-cover object-[center_45%]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,11,16,.7)_0%,rgba(27,11,16,0)_25%,rgba(27,11,16,0)_70%,rgba(251,246,236,1)_100%)]" />
        <p lang="sa" className="absolute inset-x-6 top-8 text-center font-deva text-[26px] text-gold-light">
          ॥ श्री गणेशाय नमः ॥
        </p>
      </section>

      <section className="flex flex-col items-center gap-5 px-8 pb-14 text-center">
        <h1 className="font-display text-4xl text-maroon">Our wedding site is on its way</h1>
        <p className="text-muted">If you received a personal invitation on WhatsApp, please open that link.</p>
        {isDev && (
          <nav aria-label="Demo invitations" className="mt-2 flex w-full flex-col gap-2 rounded-2xl border border-sand bg-white p-4 text-left">
            <span className="text-xs font-semibold uppercase tracking-[2px] text-quiet">Demo invitations (test only)</span>
            {seedHouseholds.map((h) => (
              <Link key={h.slug} href={`/invite/${h.slug}`} className="text-sindoor underline-offset-4 hover:underline">
                {h.displayName}
              </Link>
            ))}
          </nav>
        )}
      </section>
    </main>
  );
}
