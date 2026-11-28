"use client";

import { useActionState } from "react";
import { saveHomeText } from "@/app/admin/site-actions";
import type { FormState } from "@/app/admin/actions";

const input = "w-full rounded-xl px-3.5 py-2.5 text-[16px] outline-none";
type V = Record<string, string>;

function F({ name, label, hint, v, area, max }: { name: string; label: string; hint?: string; v: V; area?: boolean; max: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B5444]">{label}</span>
      {area ? <textarea name={name} rows={2} maxLength={max} defaultValue={v[name] ?? ""} className={input} /> : <input name={name} maxLength={max} defaultValue={v[name] ?? ""} className={input} />}
      {hint && <span className="mt-1 block text-xs text-[#8A7666]">{hint}</span>}
    </label>
  );
}

export default function HomeTextForm({ initial, readOnly }: { initial: V; readOnly: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveHomeText, {});
  const v = state.values ?? initial;
  const card = "space-y-4 rounded-[20px] border border-[#EADBC0] bg-[#FFFBF3] p-6";
  return (
    <form action={action} className="space-y-5">
      <fieldset key={state.n ?? 0} disabled={readOnly} className="space-y-5">
        <section className={card}>
          <h2 className="font-display text-2xl font-semibold text-maroon">Top of the page</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <F name="nickname" label="Couple nickname" hint="Shown under the names, e.g. Ashiran" v={v} max={40} />
            <F name="hashtag" label="Hashtag" hint="e.g. #NirajanWedsAshika" v={v} max={40} />
          </div>
          <F name="blessing" label="Blessing line" hint="Under the kalash" v={v} area max={200} />
        </section>
        <section className={card}>
          <h2 className="font-display text-2xl font-semibold text-maroon">Groom&apos;s family</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <F name="groomFamily" label="Family name" hint="e.g. Singh Family" v={v} max={60} />
            <F name="groomTradition" label="Tradition" hint="e.g. Maithil" v={v} max={40} />
            <F name="groomFrom" label="From" hint="e.g. Biratnagar" v={v} max={60} />
          </div>
        </section>
        <section className={card}>
          <h2 className="font-display text-2xl font-semibold text-maroon">Bride&apos;s family</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <F name="brideFamily" label="Family name" hint="e.g. Rayamajhi Family" v={v} max={60} />
            <F name="brideTradition" label="Tradition" hint="e.g. Pahadi" v={v} max={40} />
            <F name="brideFrom" label="From" hint="e.g. Gaighat" v={v} max={60} />
          </div>
        </section>
        {["welcome", "groomNote", "brideNote"].map((k) => <input key={k} type="hidden" name={k} value={v[k] ?? ""} />)}
      </fieldset>
      {(state.error || state.message) && <p role="status" className={`text-sm ${state.error ? "text-sindoor" : "text-[#1F6B3A]"}`}>{state.error ?? state.message}</p>}
      {!readOnly && <button disabled={pending} className="rounded-full bg-sindoor px-6 py-3 font-semibold text-[#FFF7E8] disabled:opacity-60">{pending ? "Saving…" : "Save home page text"}</button>}
    </form>
  );
}
