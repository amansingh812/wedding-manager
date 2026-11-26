"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { bulkInvite, setInvite } from "@/app/admin/invite-actions";
import type { FormState } from "@/app/admin/actions";

type H = { id: string; name: string; side: string };
type E = { id: string; name: string };
const SIDE: Record<string, string> = { groom: "G", bride: "B", common: "Both" };

export default function Matrix({ households, events, invited }: { households: H[]; events: E[]; invited: string[] }) {
  const [cells, setCells] = useState(() => new Set(invited));
  const [failed, setFailed] = useState<string | null>(null);
  const [, start] = useTransition();
  const [state, action, pending] = useActionState<FormState, FormData>(bulkInvite, {});

  function toggle(h: string, e: string) {
    const key = `${h}:${e}`;
    const on = !cells.has(key);
    setCells((p) => { const n = new Set(p); if (on) n.add(key); else n.delete(key); return n; }); // optimistic
    start(async () => {
      const res = await setInvite(h, e, on);
      if (!res.ok) {
        setFailed("Couldn't save that change. It has been undone.");
        setCells((p) => { const n = new Set(p); if (on) n.delete(key); else n.add(key); return n; });
      }
    });
  }
  const colCount = (e: string) => households.filter((h) => cells.has(`${h.id}:${e}`)).length;

  return (
    <div className="space-y-5">
      <form action={action} className="flex flex-wrap items-center gap-2 rounded-2xl border border-sand bg-white p-4 text-sm">
        <span className="font-semibold text-muted">Shortcut:</span>
        <select name="action" className="rounded-full border border-sand px-3 py-1.5"><option value="add">Invite</option><option value="remove">Remove</option></select>
        <select name="side" className="rounded-full border border-sand px-3 py-1.5">
          <option value="all">everyone</option><option value="groom">groom side</option><option value="bride">bride side</option><option value="common">both / friends</option>
        </select>
        <span className="text-muted">to</span>
        <select name="event" className="rounded-full border border-sand px-3 py-1.5">{events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
        <button disabled={pending} className="rounded-full bg-sindoor px-4 py-1.5 font-semibold text-ivory disabled:opacity-60">{pending ? "…" : "Apply"}</button>
        {(state.message || state.error) && <span className={state.error ? "text-sindoor" : "text-muted"}>{state.error ?? state.message}</span>}
      </form>
      {failed && <p role="alert" className="text-sm text-sindoor">{failed}</p>}
      <div className="overflow-x-auto rounded-2xl border border-sand bg-white">
        <table className="w-full text-sm">
          <thead className="bg-cream text-xs text-muted">
            <tr>
              <th className="sticky left-0 bg-cream px-4 py-2 text-left">Household</th>
              {events.map((e) => (
                <th key={e.id} className="px-2 py-2 text-center font-semibold">{e.name}<span className="block font-normal text-quiet">{colCount(e.id)}</span></th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sand/60">
            {households.map((h) => (
              <tr key={h.id}>
                <td className="sticky left-0 bg-white px-4 py-2">
                  <Link href={`/admin/guests/${h.id}`} className="font-semibold text-ink hover:text-sindoor">{h.name}</Link>
                  <span className="ml-2 text-xs text-quiet">{SIDE[h.side]}</span>
                </td>
                {events.map((e) => (
                  <td key={e.id} className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      aria-label={`${h.name} invited to ${e.name}`}
                      checked={cells.has(`${h.id}:${e.id}`)}
                      onChange={() => toggle(h.id, e.id)}
                      className="size-5 accent-sindoor"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
