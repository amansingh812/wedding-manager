"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveCeremony } from "@/app/admin/ceremony-actions";
import type { FormState } from "@/app/admin/actions";
import type { Ceremony } from "@/lib/types";

const input = "w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 text-[16px] text-ink outline-none focus:border-gold disabled:bg-cream/50";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-quiet">{hint}</span>}
    </label>
  );
}

export default function CeremonyForm({ ceremony, readOnly }: { ceremony: Ceremony | null; readOnly: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCeremony.bind(null, ceremony?.id ?? null), {});
  // after a failed save, refill with what was typed (React resets forms after an action)
  const v = state.values;
  const c = ceremony;
  const d = (key: string, saved: string | null | undefined) => (v ? v[key] ?? "" : saved ?? "");
  return (
    <form action={action} className="space-y-5">
      <fieldset key={state.n ?? 0} disabled={readOnly} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name"><input name="name" required maxLength={60} defaultValue={d("name", c?.name)} className={input} /></Field>
          <Field label="Subtitle" hint="Nepali or Maithili name, e.g. हल्दी"><input name="subtitle" maxLength={60} defaultValue={d("subtitle", c?.subtitle)} className={input} /></Field>
          <Field label="Date (AD)"><input name="event_date" type="date" required defaultValue={d("event_date", c?.eventDate)} className={input} /></Field>
          <Field label="Date (BS)" hint="e.g. Fagun 16"><input name="date_bs" required maxLength={30} defaultValue={d("date_bs", c?.dateBs)} className={input} /></Field>
          <Field label="Starts"><input name="starts_at" type="time" defaultValue={d("starts_at", c?.startsAt?.slice(0, 5))} className={input} /></Field>
          <Field label="Ends"><input name="ends_at" type="time" defaultValue={d("ends_at", c?.endsAt?.slice(0, 5))} className={input} /></Field>
          <Field label="Venue"><input name="venue_name" maxLength={120} defaultValue={d("venue_name", c?.venueName)} className={input} /></Field>
          <Field label="City"><input name="venue_city" maxLength={60} defaultValue={d("venue_city", c?.venueCity)} className={input} /></Field>
        </div>
        <Field label="Address"><input name="address" maxLength={200} defaultValue={d("address", c?.address)} className={input} /></Field>
        <Field label="Google Maps link" hint="Open the place in Google Maps → Share → Copy link"><input name="map_url" type="url" maxLength={500} placeholder="https://maps.app.goo.gl/…" defaultValue={d("map_url", c?.mapUrl)} className={input} /></Field>
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_120px]">
          <Field label="Dress code"><input name="dress_code" maxLength={60} placeholder="Festive" defaultValue={d("dress_code", c?.dressCode)} className={input} /></Field>
          <Field label="Dress colours" hint="Up to 4, comma separated, e.g. #e8891c, #f3d99b"><input name="dress_colors" defaultValue={d("dress_colors", c?.dressColors.join(", "))} className={input} /></Field>
          <Field label="Order"><input name="sort_order" type="number" min={0} max={99} defaultValue={d("sort_order", String(c?.sortOrder ?? 0))} className={input} /></Field>
        </div>
        <label className="flex items-center gap-3 rounded-xl border border-sand bg-white px-4 py-3">
          <input name="is_published" type="checkbox" defaultChecked={v ? v.is_published === "on" : (c?.isPublished ?? false)} className="size-5 accent-sindoor" />
          <span><b className="text-ink">Published</b> <span className="text-sm text-quiet">Guests invited to this ceremony can see it. Untick to hide it.</span></span>
        </label>
      </fieldset>
      {state.error && <p role="alert" className="text-sm text-sindoor">{state.error}</p>}
      <div className="flex items-center gap-3">
        {!readOnly && (
          <button disabled={pending} className="rounded-full bg-sindoor px-6 py-3 font-semibold text-ivory disabled:opacity-60">
            {pending ? "Saving…" : "Save ceremony"}
          </button>
        )}
        <Link href="/admin/ceremonies" className="px-3 py-3 font-semibold text-muted">{readOnly ? "Back" : "Cancel"}</Link>
      </div>
    </form>
  );
}
