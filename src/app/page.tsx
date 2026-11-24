import Image from "next/image";
import Link from "next/link";
import { seedHouseholds } from "@/lib/data/seed";

/**
 * Placeholder until the public home page is built (Phase 5).
 * In development it lists the demo invitation links for testing.
 */
export default function Home() {
  const isDev = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_DEMO_LINKS === "1";
  return (
    <main className="mx-auto flex min-h-svh max-w-[480px] flex-col items-center justify-center gap-6 bg-ivory px-8 text-center">
      <Image src="/images/kalash.webp" alt="" width={96} height={96} priority />
      <h1 className="font-display text-4xl text-maroon">Our wedding site is on its way</h1>
      <p className="text-muted">If you received a personal invitation on WhatsApp, please open that link.</p>
      {isDev && (
        <nav aria-label="Demo invitations" className="mt-4 flex w-full flex-col gap-2 rounded-2xl border border-sand bg-white p-4 text-left">
          <span className="text-xs font-semibold uppercase tracking-[2px] text-quiet">Demo invitations (test only)</span>
          {seedHouseholds.map((h) => (
            <Link key={h.slug} href={`/invite/${h.slug}`} className="text-sindoor underline-offset-4 hover:underline">
              {h.displayName}
            </Link>
          ))}
        </nav>
      )}
    </main>
  );
}
