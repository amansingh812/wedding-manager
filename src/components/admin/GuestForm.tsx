"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { deleteHousehold, saveHousehold } from "@/app/admin/guest-actions";
import type { FormState } from "@/app/admin/actions";

const input = "w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 text-[16px] text-ink outline-none focus:border-gold";

export type GuestFormData = {
  id: string;
  displayName: string;
  contactName: string | null;
  phone: string | null;
  side: "groom" | "bride" | "common";
  groupTag: string | null;
  maxGuests: number;
  notes: string | null;
  slug: string;
  eventIds: string[];
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-quiet">{hint}</span>}
    </label>
  );
}

export default function GuestForm({
  household,
  ceremonies,
  siteUrl,
}: {
  household: GuestFormData | null;
  ceremonies: { id: string; name: string; dateBs: string }[];
  siteUrl: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveHousehold.bind(null, household?.id ?? null), {});
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const v = state.values;
  const h = household;
  const d = (k: string, saved: string | null | undefined) => (v ? v[k] ?? "" : saved ?? "");
  const checkedEvents = new Set(v ? (v.events ? v.events.split(",") : []) : h ? h.eventIds : ceremonies.map((c) => c.id));
  const link = h ? `${siteUrl}/invite/${h.slug}` : null;

  return (
    <div className="space-y-8">
      {link && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-cream px-4 py-3">
          <span className="min-w-0 flex-1 truncate text-sm text-muted">{link}</span>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(link).then(() => setCopied(true))}
            className="rounded-full border border-sand bg-white px-4 py-1.5 text-sm font-semibold text-ink"
          >
            {copied ? "Copied" : "Copy invite link"}
          </button>
        </div>
      )}
      <form action={action} className="space-y-5">
        <fieldset key={state.n ?? 0} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Household name" hint="As guests will see it, e.g. Jha Family (Darbhanga)">
              <input name="display_name" required maxLength={80} defaultValue={d("display_name", h?.displayName)} className={input} />
            </Field>
            <Field label="Contact person"><input name="contact_name" maxLength={80} defaultValue={d("contact_name", h?.contactName)} className={input} /></Field>
            <Field label="WhatsApp number" hint="Nepal numbers need no code. India: +91…">
              <input name="phone" type="tel" inputMode="tel" maxLength={30} defaultValue={d("phone", h?.phone)} className={input} />
            </Field>
            <Field label="Side">
              <select name="side" defaultValue={d("side", h?.side ?? "groom")} className={input}>
                <option value="groom">Groom</option>
                <option value="bride">Bride</option>
                <option value="common">Both / friends</option>
              </select>
            </Field>
            <Field label="Group" hint="Optional, e.g. Darbhanga, Office, Mama ghar"><input name="group_tag" maxLength={40} defaultValue={d("group_tag", h?.groupTag)} className={input} /></Field>
            <Field label="Max guests"><input name="max_guests" type="number" min={1} max={30} required defaultValue={d("max_guests", String(h?.maxGuests ?? 2))} className={input} /></Field>
          </div>
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">Invited to</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {ceremonies.map((c) => (
                <label key={c.id} className="flex items-center gap-3 rounded-xl border border-sand bg-white px-4 py-2.5">
                  <input type="checkbox" name="events" value={c.id} defaultChecked={checkedEvents.has(c.id)} className="size-5 accent-sindoor" />
                  <span className="text-ink">{c.name} <span className="text-sm text-quiet">{c.dateBs}</span></span>
                </label>
              ))}
            </div>
          </div>
          <Field label="Notes (family only)"><textarea name="notes" rows={2} maxLength={500} defaultValue={d("notes", h?.notes)} className={input} /></Field>
        </fieldset>
        {state.error && <p role="alert" className="text-sm text-sindoor">{state.error}</p>}
        <div className="flex items-center gap-3">
          <button disabled={pending} className="rounded-full bg-sindoor px-6 py-3 font-semibold text-ivory disabled:opacity-60">{pending ? "Saving…" : "Save household"}</button>
          <Link href="/admin/guests" className="px-3 py-3 font-semibold text-muted">Cancel</Link>
        </div>
      </form>

      {h && (
        <form action={deleteHousehold} className="border-t border-sand pt-6">
          <input type="hidden" name="id" value={h.id} />
          <input type="hidden" name="confirm" value={confirming ? "yes" : "no"} />
          {!confirming ? (
            <button type="button" onClick={() => setConfirming(true)} className="text-sm font-semibold text-sindoor">Remove this household…</button>
          ) : (
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-[#fbeaea] px-4 py-3">
              <span className="text-sm text-ink">Remove <b>{h.displayName}</b>? Their invite link stops working. This can&apos;t be undone.</span>
              <button className="rounded-full bg-sindoor px-4 py-1.5 text-sm font-semibold text-ivory">Yes, remove</button>
              <button type="button" onClick={() => setConfirming(false)} className="text-sm font-semibold text-muted">Keep</button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
