"use client";

import { useEffect, useState } from "react";

/** Live countdown to the main day (midnight Nepal time). Server renders days only, client fills the rest. */
export default function Countdown({ dateIso, initialDays }: { dateIso: string; initialDays: number }) {
  const [left, setLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  useEffect(() => {
    const [y, mo, d] = dateIso.split("-").map(Number);
    const target = Date.UTC(y, mo - 1, d) - (5 * 60 + 45) * 60_000;
    const tick = () => {
      const ms = Math.max(0, target - Date.now());
      setLeft({ d: Math.floor(ms / 86_400_000), h: Math.floor(ms / 3_600_000) % 24, m: Math.floor(ms / 60_000) % 60, s: Math.floor(ms / 1000) % 60 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dateIso]);

  const cells = [
    { n: left?.d ?? initialDays, l: "days" },
    { n: left?.h, l: "hours" },
    { n: left?.m, l: "minutes" },
    { n: left?.s, l: "seconds" },
  ];
  return (
    <div role="timer" aria-label={`${left?.d ?? initialDays} days to go`} className="flex justify-center gap-2 sm:gap-3">
      {cells.map((c) => (
        <div key={c.l} className="w-[72px] rounded-2xl border border-gold/40 bg-night/45 py-2.5 text-center backdrop-blur sm:w-20">
          <p className="font-display text-3xl tabular-nums leading-none text-gold-light sm:text-4xl">{c.n === undefined ? "–" : String(c.n).padStart(c.l === "days" ? 1 : 2, "0")}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[.2em] text-ivory/70">{c.l}</p>
        </div>
      ))}
    </div>
  );
}
