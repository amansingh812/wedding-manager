import Image from "next/image";
import type { InviteView } from "@/lib/types";

interface Props {
  view: InviteView;
  onEdit: () => void;
  locked: boolean;
}

/** Stage 6: thank-you with a summary of their answers. */
export default function ThankYou({ view, onEdit, locked }: Props) {
  return (
    <section className="relative h-svh min-h-[700px] w-full overflow-hidden bg-night text-[#fff7e8]">
      <Image src="/images/diyas.jpg" alt="" fill sizes="480px" className="object-cover" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,8,14,.35),rgba(20,8,14,.15)_40%,rgba(20,8,14,.92))]" />

      <div className="absolute inset-x-6 top-[96px] flex flex-col items-center gap-2.5 text-center">
        <Image src="/images/diya.webp" alt="" width={96} height={96} className="diya-glow" />
        <span lang="ne" className="font-deva text-[34px] text-gold-light">
          धन्यवाद
        </span>
        <h1 className="font-display text-[40px] leading-[1.05] font-medium">
          We can&apos;t wait to
          <br />
          celebrate with you
        </h1>
      </div>

      <div className="absolute inset-x-5 bottom-10 flex flex-col gap-3">
        <div className="flex flex-col gap-2.5 rounded-[22px] bg-ivory/95 p-[18px] text-ink">
          <span className="text-[11px] uppercase tracking-[2.5px] text-[#8a6a3b]">Your RSVP</span>
          {view.ceremonies.map((c) => {
            const r = view.rsvps.find((x) => x.ceremonyId === c.id);
            return (
              <div key={c.id} className={`flex justify-between text-[15px] ${r?.attending ? "" : "text-quiet"}`}>
                <span>{c.name}</span>
                {r?.attending ? <b>{r.headcount} coming</b> : <span>{r ? "Can't make it" : "—"}</span>}
              </div>
            );
          })}
          {view.response && view.response.vegCount > 0 && (
            <div className="flex justify-between border-t border-sand pt-2 text-[13px] text-quiet">
              <span>Vegetarian meals</span>
              <span>{view.response.vegCount}</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-[50px] items-center justify-center rounded-full border border-gold-light/60 text-sm font-semibold text-gold-light transition-colors hover:bg-white/10"
          >
            {locked ? "View details" : "Edit RSVP"}
          </button>
          <a
            href={`/invite/${view.household.slug}/calendar.ics`}
            className="flex h-[50px] items-center justify-center rounded-full bg-gold text-sm font-bold text-[#2a0709] transition-colors hover:bg-gold-hover"
          >
            Save dates
          </a>
        </div>
      </div>
    </section>
  );
}
