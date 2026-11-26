"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { addItem, addStarters, deleteItem, setItemDone } from "@/app/admin/checklist-actions";
import type { FormState } from "@/app/admin/actions";
import { KIND_LABEL } from "@/lib/checklist-starters";

export type Item = {
  id: string; title: string; kind: keyof typeof KIND_LABEL; group: string | null; qty: string | null;
  ownerName: string | null; due: string | null; done: boolean; eventName: string | null;
};

const KIND_TONE: Record<string, string> = { buy: "bg-[#fdf0dc] text-[#8a5a12]", bring: "bg-[#e9f0f7] text-[#2c4f73]", do: "bg-[#eef3e8] text-[#3f5d2a]", book: "bg-[#f6e6ee] text-[#7a2d55]" };

export function ItemRow({ item, today, canDelete }: { item: Item; today: string; canDelete: boolean }) {
  const [done, setDone] = useState(item.done);
  const [, start] = useTransition();
  const overdue = !done && item.due && item.due < today;
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <input
        type="checkbox"
        aria-label={`Done: ${item.title}`}
        checked={done}
        onChange={(e) => {
          const v = e.target.checked;
          setDone(v);
          start(async () => { if (!(await setItemDone(item.id, v)).ok) setDone(!v); });
        }}
        className="mt-0.5 size-5 shrink-0 accent-sindoor"
      />
      <div className="min-w-0 flex-1">
        <p className={`text-ink ${done ? "text-quiet line-through" : ""}`}>
          {item.title} {item.qty && <span className="text-sm text-quiet">· {item.qty}</span>}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-quiet">
          <span className={`rounded-full px-2 py-0.5 font-semibold ${KIND_TONE[item.kind]}`}>{KIND_LABEL[item.kind]}</span>
          {item.eventName && <span>{item.eventName}</span>}
          {item.ownerName && <span>👤 {item.ownerName}</span>}
          {item.due && <span className={overdue ? "font-semibold text-sindoor" : ""}>{overdue ? "Overdue · " : "Due "}{new Date(item.due + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
        </p>
      </div>
      {canDelete && (
        <form action={deleteItem}><input type="hidden" name="id" value={item.id} /><button aria-label={`Delete ${item.title}`} className="px-1 text-quiet hover:text-sindoor">×</button></form>
      )}
    </li>
  );
}

const field = "rounded-xl border border-sand bg-white px-3 py-2 text-[16px] outline-none focus:border-gold";

export function AddItemForm({ events, members, eventId }: { events: { id: string; name: string }[]; members: { id: string; name: string }[]; eventId: string | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addItem, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.querySelector<HTMLInputElement>("input[name=title]")?.focus(); }, [state]);
  const v = state.ok ? undefined : state.values;
  return (
    <form ref={ref} key={state.n ?? 0} action={action} className="space-y-3 rounded-2xl border border-sand bg-white p-4">
      <div className="flex gap-2">
        <input name="title" required maxLength={120} placeholder="Add an item, e.g. Marigold garlands" defaultValue={v?.title} className={`${field} min-w-0 flex-1`} />
        <button disabled={pending} className="shrink-0 rounded-full bg-sindoor px-5 font-semibold text-ivory disabled:opacity-60">{pending ? "…" : "Add"}</button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
        <select name="kind" defaultValue={v?.kind ?? "buy"} className={field} aria-label="Type">{Object.entries(KIND_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <select name="event_id" defaultValue={v?.event_id ?? eventId ?? ""} className={`${field} sm:col-span-2`} aria-label="Ceremony">
          <option value="">General</option>{events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select name="owner_id" defaultValue={v?.owner_id ?? ""} className={field} aria-label="Who"><option value="">Anyone</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
        <input name="quantity" maxLength={30} placeholder="Qty" defaultValue={v?.quantity} className={field} />
        <input name="due_date" type="date" defaultValue={v?.due_date} className={field} aria-label="Due date" />
      </div>
      <input type="hidden" name="group_name" value="" />
      {(state.error || state.message) && <p role="status" className={`text-sm ${state.error ? "text-sindoor" : "text-muted"}`}>{state.error ?? state.message}</p>}
    </form>
  );
}

export function StarterButton({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addStarters, {});
  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="event_id" value={eventId} />
      <button disabled={pending} className="rounded-full border border-gold bg-cream px-4 py-2 text-sm font-semibold text-maroon disabled:opacity-60">
        {pending ? "Adding…" : `✨ Add starter list for ${eventName}`}
      </button>
      {(state.error || state.message) && <span className={`text-sm ${state.error ? "text-sindoor" : "text-muted"}`}>{state.error ?? state.message}</span>}
    </form>
  );
}
