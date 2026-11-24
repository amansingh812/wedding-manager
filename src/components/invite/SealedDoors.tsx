"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface Props {
  displayName: string;
  coupleLine: string;
  onOpened: () => void;
}

/** Stage 1–2: sealed temple doors, then the doors-opening clip. */
export default function SealedDoors({ displayName, coupleLine, onOpened }: Props) {
  const [opening, setOpening] = useState(false);
  const reduceMotion = useReducedMotion();
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    onOpened();
  };

  // Never leave a guest stuck if the clip stalls on slow data.
  useEffect(() => {
    if (!opening) return;
    const t = setTimeout(finish, 6500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opening]);

  const open = () => {
    if (reduceMotion) return finish();
    setOpening(true);
  };

  return (
    <section className="relative h-svh min-h-[640px] w-full overflow-hidden bg-night text-[#fff7e8]">
      <Image src="/images/doors.jpg" alt="" fill priority sizes="480px" className="object-cover" />
      {!opening && !reduceMotion && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/video/doors-loop.mp4"
          poster="/images/doors.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      )}
      {opening && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/video/doors-open.mp4"
          poster="/images/doors.jpg"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={finish}
          onError={finish}
          aria-hidden="true"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,8,14,.55)_0%,rgba(20,8,14,0)_28%,rgba(20,8,14,0)_50%,rgba(20,8,14,.9)_100%)]"
      />

      <div className="absolute inset-x-0 top-14 flex flex-col items-center gap-1.5 text-center">
        <span lang="ne" className="font-deva text-[22px] text-gold-light">
          सादर निमन्त्रणा
        </span>
        <span className="text-[11px] uppercase tracking-[3px] text-cream">{coupleLine}</span>
      </div>

      {!opening && (
        <div className="absolute inset-x-6 bottom-14 flex flex-col items-center gap-[18px] text-center">
          <button
            type="button"
            onClick={open}
            aria-label="Open your invitation"
            className="seal-pulse grid h-28 w-28 place-items-center rounded-full transition-transform hover:scale-105 active:scale-95"
          >
            <Image src="/images/kalash.webp" alt="" width={112} height={112} priority />
          </button>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[2.5px] text-gold-light">A warm invitation for</span>
            <h1 className="font-display text-[34px] leading-tight font-medium">{displayName}</h1>
          </div>
          <span className="text-[13px] text-[#ebd9b6]">Tap the seal to open</span>
        </div>
      )}
      {opening && (
        <button
          type="button"
          onClick={finish}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full px-5 py-3 text-sm text-gold-light/90 underline-offset-4 hover:underline"
        >
          Skip
        </button>
      )}
    </section>
  );
}
