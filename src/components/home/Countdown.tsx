"use client";

import { useEffect, useState } from "react";

/** Live countdown to the main day (midnight Nepal time), styled like the design's glass boxes. */
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
  const pad = (n?: number) => (n === undefined ? "–" : String(n).padStart(2, "0"));
  const cells = [
    { v: String(left?.d ?? initialDays), l: "Days" },
    { v: pad(left?.h), l: "Hours" },
    { v: pad(left?.m), l: "Mins" },
    { v: pad(left?.s), l: "Secs" },
  ];
  return (
    <div role="timer" aria-label={`${left?.d ?? initialDays} days to go`} className="flex flex-wrap gap-3">
      {cells.map((c) => (
        <div key={c.l} className="flex w-[76px] flex-col items-center gap-1 rounded-2xl border border-[rgba(243,217,155,.35)] bg-[rgba(255,247,232,.1)] pb-3 pt-4 backdrop-blur-sm sm:w-[92px]">
          <span className="font-display text-[34px] leading-none tabular-nums text-[#FFF7E8] sm:text-[40px]">{c.v}</span>
          <span className="text-[11px] uppercase tracking-[2px] text-gold-light">{c.l}</span>
        </div>
      ))}
    </div>
  );
}
