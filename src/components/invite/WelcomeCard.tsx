"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Petals from "./Petals";
import type { Wedding } from "@/lib/types";
import { formatAdLong } from "@/lib/format";

interface Props {
  wedding: Wedding;
  displayName: string;
  places: string;
  onContinue: () => void;
}

const REVEAL_MS = 2800;

/**
 * Stage 3, right after the doors open:
 *  1. Lord Ganesh is revealed inside the courtyard with "॥ श्री गणेशाय नमः ॥"
 *  2. He stays in the background while the invitation card rises over him.
 */
export default function WelcomeCard({ wedding, displayName, places, onContinue }: Props) {
  const reduceMotion = useReducedMotion();
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowCard(true), reduceMotion ? 900 : REVEAL_MS);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  return (
    <section
      className="relative h-svh min-h-[700px] w-full overflow-hidden bg-night"
      onClick={() => setShowCard(true)}
    >
      {/* Ganesh — stays in the background for the whole welcome */}
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 5, ease: "easeOut" }}
      >
        <Image
          src="/images/ganesh-courtyard.jpg"
          alt="Lord Ganesh inside the temple courtyard, surrounded by diyas"
          fill
          priority
          sizes="480px"
          className="object-cover object-top"
        />
      </motion.div>

      {/* golden bloom that carries on from the doors-opening clip */}
      {!reduceMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,236,190,.95),rgba(255,214,140,.55)_40%,rgba(27,11,16,0)_75%)]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />
      )}

      {/* darken the lower half once the card is up so the words stay readable */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,11,16,.25)_0%,rgba(27,11,16,0)_22%,rgba(27,11,16,.15)_45%,rgba(27,11,16,.7)_100%)]"
        animate={{ opacity: showCard ? 1 : 0.4 }}
        transition={{ duration: 0.8 }}
      />
      <Petals />

      <motion.p
        lang="sa"
        className="absolute inset-x-6 top-7 text-center font-deva text-[24px] text-gold-light [text-shadow:0_2px_12px_rgba(0,0,0,.6)]"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : 0.9, duration: 0.8 }}
      >
        ॥ श्री गणेशाय नमः ॥
      </motion.p>

      <AnimatePresence>
        {!showCard && (
          <motion.p
            key="tap-hint"
            className="absolute inset-x-6 bottom-12 text-center text-xs uppercase tracking-[3px] text-cream [text-shadow:0_1px_8px_rgba(0,0,0,.7)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: reduceMotion ? 0 : 1.4, duration: 0.6 }}
          >
            Shree Ganeshaya Namah
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCard && (
          <motion.div
            key="card"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 80, rotateX: -12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: reduceMotion ? 0.3 : 1.1, ease: [0.2, 0.7, 0.2, 1] }}
            style={{ transformPerspective: 900 }}
            className="absolute inset-x-[22px] top-[38%] bottom-[104px] flex flex-col items-center justify-center gap-2.5 rounded-[140px_140px_26px_26px] bg-ivory/[.93] px-6 pt-10 pb-6 text-center shadow-[0_-10px_50px_rgba(0,0,0,.35)] backdrop-blur-sm"
          >
            <span lang="ne" className="font-deva text-[15px] text-sindoor">
              नमस्ते
            </span>
            <span className="font-display text-[22px] leading-tight italic text-[#5e0f12]">{displayName}</span>
            <span aria-hidden="true" className="h-px w-[56px] bg-gold" />
            <span className="text-[11px] uppercase tracking-[2.5px] text-[#8a6a3b]">together with their families</span>
            <h1 className="font-display text-[46px] leading-[.95] font-medium text-maroon">
              {wedding.groomName}
              <span className="mx-2 text-[.6em] italic text-gold">&amp;</span>
              {wedding.brideName}
            </h1>
            <span className="text-sm leading-normal text-muted">request your blessings and presence</span>
            <span className="text-[12.5px] font-bold tracking-[1.5px] text-maroon uppercase">
              {wedding.mainDateBs} · {formatAdLong(wedding.mainDate)}
            </span>
            {places && <span className="text-xs text-quiet">{places}</span>}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCard && (
          <motion.button
            key="cta"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onContinue();
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.7, duration: 0.5 }}
            className="absolute inset-x-[22px] bottom-8 flex h-14 items-center justify-center gap-2.5 rounded-full bg-gold text-[15px] font-bold text-[#2a0709] transition-colors hover:bg-gold-hover"
          >
            See your ceremonies
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
}
