"use client";

import { useState, useTransition } from "react";
import type { InviteView } from "@/lib/types";
import { formatAd } from "@/lib/format";
import { BLESSING_MAX } from "@/lib/rsvp";
import { submitRsvp } from "@/app/invite/[slug]/actions";

type Answer = { attending: boolean | null; headcount: number };

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  const b =
    "grid h-11 w-11 place-items-center rounded-full border border-sand bg-[#fffbf3] text-xl text-maroon transition-colors hover:bg-[#f3e6cc] disabled:opacity-40";
  return (
    <div className="flex items-center gap-2.5" role="group" aria-label={label}>
      <button type="button" className={b} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Fewer: ${label}`}>
        −
      </button>
      <span className="min-w-11 text-center font-display text-[28px] font-semibold [font-variant-numeric:lining-nums_tabular-nums]" aria-live="polite">
        {value}
        {suffix && <span className="text-base text-[#8a7666]">{suffix}</span>}
      </span>
      <button type="button" className={b} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`More: ${label}`}>
        +
      </button>
    </div>
  );
}

interface Props {
  view: InviteView;
  locked: boolean;
  onSaved: (view: InviteView) => void;
}

export default function RsvpForm({ view, locked, onSaved }: Props) {
  const max = view.household.maxGuests;
  const [answers, setAnswers] = useState<Record<string, Answer>>(() =>
    Object.fromEntries(
      view.ceremonies.map((c) => {
        const prev = view.rsvps.find((r) => r.ceremonyId === c.id);
        return [c.id, prev ? { attending: prev.attending, headcount: prev.attending ? prev.headcount : Math.min(2, max) } : { attending: null, headcount: Math.min(2, max) }];
      }),
    ),
  );
  const [veg, setVeg] = useState(view.response?.vegCount ?? 0);
  const [blessing, setBlessing] = useState(view.response?.blessing ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const maxHeads = Math.max(0, ...Object.values(answers).map((a) => (a.attending ? a.headcount : 0)));
  const vegShown = Math.min(veg, maxHeads);
  const unanswered = view.ceremonies.filter((c) => answers[c.id]?.attending === null);

  const set = (id: string, patch: Partial<Answer>) => {
    setError(null);
    setAnswers((s) => ({ ...s, [id]: { ...s[id], ...patch } }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    if (unanswered.length) {
      setError(`Please choose for ${unanswered.map((c) => c.name).join(", ")}.`);
      return;
    }
    setError(null);
    start(async () => {
      const res = await submitRsvp(view.household.slug, {
        answers: view.ceremonies.map((c) => ({
          ceremonyId: c.id,
          attending: answers[c.id].attending === true,
          headcount: answers[c.id].attending ? answers[c.id].headcount : 0,
        })),
        vegCount: vegShown,
        blessing,
      });
      if (res.ok) onSaved(res.view);
      else setError(res.error);
    });
  };

  const seg = (on: boolean) =>
    `h-[46px] rounded-full border-[1.5px] text-sm font-semibold transition-colors ${
      on ? "border-maroon bg-maroon text-[#fff7e8]" : "border-sand bg-[#fffbf3] text-maroon hover:bg-[#f3e6cc]"
    } disabled:cursor-not-allowed`;

  return (
    <form onSubmit={submit} className="flex flex-col gap-3.5" aria-describedby={error ? "rsvp-error" : undefined}>
      {locked && (
        <p className="rounded-2xl bg-[#fbebc8] px-4 py-3 text-sm text-[#7a5410]">
          RSVPs are now closed. To change your answer, please call the family.
        </p>
      )}
      {view.ceremonies.map((c) => {
        const a = answers[c.id];
        return (
          <fieldset key={c.id} className="flex flex-col gap-3 rounded-[20px] bg-white p-4 shadow-[0_6px_18px_rgba(58,10,12,.06)]" disabled={locked}>
            <legend className="sr-only">{c.name} attendance</legend>
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-2xl font-semibold text-maroon">{c.name}</h3>
              <span className="text-xs text-quiet">{formatAd(c.eventDate)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className={seg(a.attending === true)} aria-pressed={a.attending === true} onClick={() => set(c.id, { attending: true })}>
                Will attend
              </button>
              <button type="button" className={seg(a.attending === false)} aria-pressed={a.attending === false} onClick={() => set(c.id, { attending: false })}>
                Can&apos;t make it
              </button>
            </div>
            {a.attending && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm text-[#3a2a20]">People coming</span>
                <Stepper
                  label={`People coming to ${c.name}`}
                  value={a.headcount}
                  min={1}
                  max={max}
                  suffix={` / ${max}`}
                  onChange={(n) => set(c.id, { headcount: n })}
                />
              </div>
            )}
          </fieldset>
        );
      })}

      {maxHeads > 0 && (
        <div className="flex items-center justify-between rounded-[20px] bg-white p-4 shadow-[0_6px_18px_rgba(58,10,12,.06)]">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">Vegetarian meals</span>
            <span className="text-xs text-quiet">The rest get non-veg</span>
          </div>
          <Stepper label="Vegetarian meals" value={vegShown} min={0} max={maxHeads} onChange={(n) => !locked && setVeg(n)} />
        </div>
      )}

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold">
          A blessing for the couple <span className="font-normal text-quiet">(optional)</span>
        </span>
        <textarea
          rows={3}
          maxLength={BLESSING_MAX}
          value={blessing}
          disabled={locked}
          onChange={(e) => setBlessing(e.target.value)}
          placeholder="Shubhakamana…"
          className="resize-none rounded-2xl border border-sand bg-white px-4 py-3.5 font-display text-[19px] text-ink outline-none focus:border-gold"
        />
      </label>

      {error && (
        <p id="rsvp-error" role="alert" className="rounded-2xl bg-[#f3e4da] px-4 py-3 text-sm text-[#7a3a1e]">
          {error}
        </p>
      )}

      {!locked && (
        <button
          type="submit"
          disabled={pending}
          className="flex h-[58px] items-center justify-center rounded-full bg-sindoor text-base font-bold text-[#fff7e8] transition-colors hover:bg-sindoor-dark disabled:opacity-70"
        >
          {pending ? "Sending…" : view.response ? "Update RSVP" : "Send RSVP"}
        </button>
      )}
      <span className="text-center text-xs text-quiet">You can change this anytime from the same link.</span>
    </form>
  );
}
