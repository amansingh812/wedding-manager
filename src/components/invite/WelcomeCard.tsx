"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import Petals from "./Petals";
import type { Wedding } from "@/lib/types";
import { formatAdLong } from "@/lib/format";

interface Props {
  wedding: Wedding;
  displayName: string;
  places: string;
  onContinue: () => void;
}

/** Stage 3: the arched ivory card that unfolds after the doors open. */
export default function WelcomeCard({ wedding, displayName, places, onContinue }: Props) {
  const reduceMotion = useReducedMotion();
  return (
    <section className="relative h-svh min-h-[680px] w-full overflow-hidden bg-night">
      <Image src="/images/courtyard.jpg" alt="" fill priority sizes="480px" className="object-cover" />
      <div aria-hidden="true" className="absolute inset-0 bg-night/35" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/mandala.webp"
        alt=""
        aria-hidden="true"
        className="mandala-spin pointer-events-none absolute left-1/2 top-[46%] h-[560px] w-[560px] max-w-none opacity-[.14] mix-blend-screen"
        style={{ transform: "translate(-50%,-50%)" }}
      />
      <Petals />

      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, rotateX: -18, y: 30 }}
        animate={{ opacity: 1, rotateX: 0, y: 0 }}
        transition={{ duration: reduceMotion ? 0.3 : 1, ease: [0.2, 0.7, 0.2, 1] }}
        style={{ transformPerspective: 900 }}
        className="absolute inset-x-[22px] top-[78px] bottom-[116px] flex flex-col items-center justify-center gap-3.5 rounded-[160px_160px_26px_26px] bg-ivory/95 px-7 py-9 text-center shadow-[0_30px_60px_rgba(0,0,0,.35)]"
      >
        <Image src="/images/fish.webp" alt="" width={64} height={64} />
        <span lang="ne" className="font-deva text-base text-sindoor">
          नमस्ते
        </span>
        <span className="font-display text-2xl leading-tight italic text-[#5e0f12]">{displayName}</span>
        <span aria-hidden="true" className="h-px w-[60px] bg-gold" />
        <span className="text-xs uppercase tracking-[2.5px] text-[#8a6a3b]">together with their families</span>
        <h1 className="font-display text-[56px] leading-[.95] font-medium text-maroon">
          {wedding.groomName}
          <br />
          <span className="text-[.55em] italic text-gold">&amp;</span>
          <br />
          {wedding.brideName}
        </h1>
        <span className="text-sm leading-normal text-muted">request your blessings and presence</span>
        <span className="text-[13px] font-bold tracking-[1.5px] text-maroon uppercase">
          {wedding.mainDateBs} · {formatAdLong(wedding.mainDate)}
        </span>
        {places && <span className="text-xs text-quiet">{places}</span>}
      </motion.div>

      <button
        type="button"
        onClick={onContinue}
        className="absolute inset-x-[22px] bottom-10 flex h-14 items-center justify-center gap-2.5 rounded-full bg-gold text-[15px] font-bold text-[#2a0709] transition-colors hover:bg-gold-hover"
      >
        See your ceremonies
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      </button>
    </section>
  );
}
