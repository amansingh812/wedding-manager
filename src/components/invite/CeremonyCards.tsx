import Image from "next/image";
import type { Ceremony } from "@/lib/types";
import { formatAd, formatTime } from "@/lib/format";

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function CalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

const btn =
  "flex h-[46px] items-center justify-center gap-2 rounded-full border border-sand text-[13px] font-semibold text-maroon transition-colors hover:bg-[#f3e6cc]";

export default function CeremonyCards({ ceremonies, slug }: { ceremonies: Ceremony[]; slug: string }) {
  return (
    <ul className="flex flex-col gap-[18px]">
      {ceremonies.map((c) => {
        const time = formatTime(c.startsAt);
        const where = [c.venueName, c.venueCity].filter(Boolean).join(", ");
        return (
          <li key={c.id} className="overflow-hidden rounded-3xl bg-white shadow-[0_12px_30px_rgba(58,10,12,.10)]">
            <div className="relative h-[190px]">
              {c.imagePath && (
                <Image src={c.imagePath} alt="" fill sizes="(max-width: 480px) 100vw, 444px" className="object-cover" />
              )}
              <div className="absolute left-3.5 top-3.5 flex flex-col items-center gap-px rounded-[14px] bg-ivory/95 px-3 py-2">
                <span className="text-[11px] font-bold tracking-[1px] text-sindoor uppercase">{c.dateBs}</span>
                <span className="text-[11px] text-muted">{formatAd(c.eventDate)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 px-[18px] pt-[18px] pb-5">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-[30px] leading-none font-semibold text-maroon">
                  {c.name}
                  {c.subtitle && (
                    <span lang="ne" className="ml-2 font-deva text-sm font-normal text-quiet">
                      {c.subtitle}
                    </span>
                  )}
                </h2>
                {time && <span className="text-sm font-semibold whitespace-nowrap text-muted">{time}</span>}
              </div>
              {where && <p className="text-sm text-muted">{where}</p>}
              {c.dressColors.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-quiet">Wear</span>
                  {c.dressColors.map((hex) => (
                    <span key={hex} className="h-[18px] w-[18px] rounded-full border border-black/15" style={{ background: hex }} aria-hidden="true" />
                  ))}
                  {c.dressCode && <span className="text-xs text-quiet">{c.dressCode}</span>}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2.5">
                {c.mapUrl ? (
                  <a className={btn} href={c.mapUrl} target="_blank" rel="noopener noreferrer">
                    <PinIcon />
                    Maps
                  </a>
                ) : (
                  <span className={`${btn} cursor-default opacity-50`} aria-disabled="true">
                    <PinIcon />
                    Maps soon
                  </span>
                )}
                <a className={btn} href={`/invite/${slug}/calendar.ics?event=${encodeURIComponent(c.id)}`}>
                  <CalIcon />
                  Calendar
                </a>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
