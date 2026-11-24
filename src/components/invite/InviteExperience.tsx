"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { InviteView } from "@/lib/types";
import { seenCookie } from "@/lib/rsvp";
import SealedDoors from "./SealedDoors";
import WelcomeCard from "./WelcomeCard";
import CeremonyCards from "./CeremonyCards";
import RsvpForm from "./RsvpForm";
import ThankYou from "./ThankYou";
import ClosingBlessing from "./ClosingBlessing";

type Stage = "sealed" | "welcome" | "content" | "thanks";


function placesFrom(view: InviteView): string {
  const set = new Set<string>();
  for (const c of view.ceremonies) {
    for (const p of (c.venueCity ?? "").split(/&|→|,/)) {
      const t = p.trim();
      if (t) set.add(t);
    }
  }
  return [...set].join(" · ");
}

interface Props {
  initialView: InviteView;
  locked: boolean;
  /** Opened on this phone before (cookie). */
  seenBefore: boolean;
}

export default function InviteExperience({ initialView, locked, seenBefore }: Props) {
  const [view, setView] = useState(initialView);
  // The full opening plays on every visit. Guests who replied or opened before
  // also get a shortcut straight to their ceremonies.
  const [stage, setStage] = useState<Stage>("sealed");
  const returning = Boolean(view.response) || seenBefore;
  const slug = view.household.slug;
  const places = useMemo(() => placesFrom(view), [view]);
  const coupleLine = `${view.wedding.title} · ${view.wedding.mainDateBs}`;

  const go = (next: Stage) => {
    setStage(next);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  const markSeen = () => {
    document.cookie = `${seenCookie(slug)}=1; Max-Age=31536000; Path=/invite; SameSite=Lax`;
  };

  return (
    <main className="mx-auto min-h-svh max-w-[480px] bg-ivory shadow-[0_0_80px_rgba(0,0,0,.5)]">
      <AnimatePresence mode="wait">
        <motion.div key={stage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
          {stage === "sealed" && (
            <SealedDoors
              displayName={view.household.displayName}
              coupleLine={coupleLine}
              onOpened={() => {
                markSeen();
                go("welcome");
              }}
              onSkipToCeremonies={returning ? () => go("content") : undefined}
            />
          )}

          {stage === "welcome" && (
            <WelcomeCard wedding={view.wedding} displayName={view.household.displayName} places={places} onContinue={() => go("content")} />
          )}

          {stage === "content" && (
            <div className="pb-10">
              <header className="relative h-[230px] overflow-hidden">
                <Image src="/images/velvet.jpg" alt="" fill priority sizes="480px" className="object-cover" />
                <div className="relative flex flex-col gap-2 px-6 pt-14">
                  <span className="text-[11px] uppercase tracking-[3px] text-gold-light">For {view.household.displayName}</span>
                  <h1 className="font-display text-[44px] leading-none font-medium text-[#fff7e8]">Your ceremonies</h1>
                  <span lang="ne" className="font-deva text-[15px] text-gold-light">
                    तपाईंलाई निम्तो गरिएका कार्यक्रम
                  </span>
                  <button
                    type="button"
                    onClick={() => go("sealed")}
                    className="mt-1 self-start rounded-full border border-gold-light/50 px-3.5 py-2 text-xs font-semibold text-gold-light transition-colors hover:bg-white/10"
                  >
                    Watch the invitation again
                  </button>
                </div>
              </header>

              <div className="relative -mt-[34px] flex flex-col gap-[18px] px-[18px]">
                <CeremonyCards ceremonies={view.ceremonies} slug={slug} />

                <section aria-labelledby="rsvp-title" className="mt-4 flex flex-col gap-3.5">
                  <div className="relative overflow-hidden rounded-3xl">
                    <Image src="/images/hands.jpg" alt="" width={444} height={180} className="h-[150px] w-full object-cover object-[center_60%]" />
                    <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(58,10,12,.15),rgba(58,10,12,.85))]" />
                    <div className="absolute inset-x-5 bottom-4 flex flex-col gap-1">
                      <h2 id="rsvp-title" className="font-display text-[34px] leading-none font-medium text-[#fff7e8]">
                        Will you join us?
                      </h2>
                      <span className="text-[13px] text-gold-light">
                        {view.household.displayName} · up to {view.household.maxGuests} guests
                      </span>
                    </div>
                  </div>
                  <RsvpForm
                    key={view.response?.updatedAt ?? "new"}
                    view={view}
                    locked={locked}
                    onSaved={(v) => {
                      setView(v);
                      go("thanks");
                    }}
                  />
                </section>

                <ClosingBlessing />
              </div>
            </div>
          )}

          {stage === "thanks" && <ThankYou view={view} locked={locked} onEdit={() => go("content")} />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
