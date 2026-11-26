"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { deleteExpense, saveExpense } from "@/app/admin/expense-actions";
import type { FormState } from "@/app/admin/actions";

const input = "w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 text-[16px] text-ink outline-none focus:border-gold disabled:bg-cream/50";

export type ExpenseData = { id: string; title: string; eventId: string | null; vendorName: string | null; vendorPhone: string | null; total: number; paid: number; notes: string | null };

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>{children}</label>;
}

export default function ExpenseForm({ expense, events, readOnly }: { expense: ExpenseData | null; events: { id: string; name: string }[]; readOnly: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveExpense.bind(null, expense?.id ?? null), {});
  const [confirming, setConfirming] = useState(false);
  const v = state.values;
  const x = expense;
  const d = (k: string, saved: string | number | null | undefined) => (v ? v[k] ?? "" : saved == null ? "" : String(saved));
  return (
    <div className="space-y-8">
      <form action={action} className="space-y-5">
        <fieldset key={state.n ?? 0} disabled={readOnly} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="What for"><input name="title" required maxLength={100} placeholder="Catering, tent, band…" defaultValue={d("title", x?.title)} className={input} /></F>
            <F label="Ceremony">
              <select name="event_id" defaultValue={d("event_id", x?.eventId)} className={input}>
                <option value="">General / whole wedding</option>{events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </F>
            <F label="Total (रु)"><input name="total_amount" inputMode="decimal" required placeholder="1,50,000" defaultValue={d("total_amount", x?.total)} className={input} /></F>
            <F label="Paid so far (रु)"><input name="paid_amount" inputMode="decimal" placeholder="50,000" defaultValue={d("paid_amount", x?.paid ?? 0)} className={input} /></F>
            <F label="Vendor"><input name="vendor_name" maxLength={80} defaultValue={d("vendor_name", x?.vendorName)} className={input} /></F>
            <F label="Vendor phone"><input name="vendor_phone" type="tel" maxLength={30} defaultValue={d("vendor_phone", x?.vendorPhone)} className={input} /></F>
          </div>
          <F label="Notes"><textarea name="notes" rows={2} maxLength={500} defaultValue={d("notes", x?.notes)} className={input} /></F>
        </fieldset>
        {state.error && <p role="alert" className="text-sm text-sindoor">{state.error}</p>}
        <div className="flex items-center gap-3">
          {!readOnly && <button disabled={pending} className="rounded-full bg-sindoor px-6 py-3 font-semibold text-ivory disabled:opacity-60">{pending ? "Saving…" : "Save expense"}</button>}
          <Link href="/admin/expenses" className="px-3 py-3 font-semibold text-muted">{readOnly ? "Back" : "Cancel"}</Link>
        </div>
      </form>
      {x && !readOnly && (
        <form action={deleteExpense} className="border-t border-sand pt-6">
          <input type="hidden" name="id" value={x.id} />
          <input type="hidden" name="confirm" value={confirming ? "yes" : "no"} />
          {!confirming ? (
            <button type="button" onClick={() => setConfirming(true)} className="text-sm font-semibold text-sindoor">Delete this expense…</button>
          ) : (
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-[#fbeaea] px-4 py-3">
              <span className="text-sm text-ink">Delete <b>{x.title}</b>? This can&apos;t be undone.</span>
              <button className="rounded-full bg-sindoor px-4 py-1.5 text-sm font-semibold text-ivory">Yes, delete</button>
              <button type="button" onClick={() => setConfirming(false)} className="text-sm font-semibold text-muted">Keep</button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
