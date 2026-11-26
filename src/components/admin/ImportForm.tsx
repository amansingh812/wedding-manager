"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { importGuests, type ImportState } from "@/app/admin/guest-actions";

const SIDE = { groom: "Groom", bride: "Bride", common: "Both" } as const;

export default function ImportForm({ ceremonies }: { ceremonies: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<ImportState, FormData>(importGuests, {});
  const modeRef = useRef<HTMLInputElement>(null);
  // controlled, so the paste survives React's form reset between "Check" and "Add"
  const [text, setText] = useState("");
  const [side, setSide] = useState("groom");
  const [events, setEvents] = useState<Set<string>>(() => new Set(ceremonies.map((c) => c.id)));
  const ok = state.rows?.filter((r) => !r.problems.length && !r.duplicate).length ?? 0;

  if (state.imported !== undefined) {
    return (
      <div className="rounded-2xl bg-cream p-6">
        <p className="font-display text-2xl text-maroon">Added {state.imported} household{state.imported === 1 ? "" : "s"}</p>
        {!!state.skipped && <p className="mt-1 text-sm text-muted">{state.skipped} skipped (problems or already on the list).</p>}
        <Link href="/admin/guests" className="mt-4 inline-block rounded-full bg-sindoor px-5 py-2.5 font-semibold text-ivory">See the guest list</Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <input ref={modeRef} type="hidden" name="mode" value="preview" />
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">Paste rows</span>
        <textarea
          name="text"
          rows={8}
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Jha Family (Darbhanga)\t9812345678\tgroom\t4\tDarbhanga\nOffice – Tech Team\t\tcommon\t6\tOffice"}
          className="w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-gold"
        />
        <span className="mt-1 block text-xs text-quiet">Columns in this order: Name · Phone · Side (groom/bride/both) · Guests · Group. Only Name is required. A header row is fine.</span>
      </label>
      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">Side if blank</span>
          <select name="side" value={side} onChange={(e) => setSide(e.target.value)} className="w-full rounded-xl border border-sand bg-white px-3.5 py-2.5">
            <option value="groom">Groom</option><option value="bride">Bride</option><option value="common">Both / friends</option>
          </select>
        </label>
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">Invite everyone to</span>
          <div className="flex flex-wrap gap-2">
            {ceremonies.map((c) => (
              <label key={c.id} className="flex items-center gap-2 rounded-full border border-sand bg-white px-3 py-1.5 text-sm">
                <input
                  type="checkbox"
                  name="events"
                  value={c.id}
                  checked={events.has(c.id)}
                  onChange={(e) => setEvents((prev) => { const n = new Set(prev); if (e.target.checked) n.add(c.id); else n.delete(c.id); return n; })}
                  className="accent-sindoor"
                /> {c.name}
              </label>
            ))}
          </div>
        </div>
      </div>

      {state.error && <p role="alert" className="text-sm text-sindoor">{state.error}</p>}

      {state.rows && (
        <div className="overflow-x-auto rounded-2xl border border-sand bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream text-xs uppercase tracking-wide text-muted">
              <tr><th className="px-4 py-2">Name</th><th className="px-4 py-2">Phone</th><th className="px-4 py-2">Side</th><th className="px-4 py-2">Guests</th><th className="px-4 py-2">Group</th><th className="px-4 py-2">Check</th></tr>
            </thead>
            <tbody className="divide-y divide-sand/60">
              {state.rows.map((r) => (
                <tr key={r.line} className={r.problems.length || r.duplicate ? "bg-[#fdf3e4]" : ""}>
                  <td className="px-4 py-2 font-semibold text-ink">{r.displayName || "—"}</td>
                  <td className="px-4 py-2 text-muted">{r.phone ?? "—"}</td>
                  <td className="px-4 py-2 text-muted">{SIDE[r.side]}</td>
                  <td className="px-4 py-2 text-muted">{r.maxGuests}</td>
                  <td className="px-4 py-2 text-muted">{r.groupTag ?? "—"}</td>
                  <td className="px-4 py-2 text-xs">
                    {r.duplicate ? <span className="text-marigold">Already on list, will skip</span> : r.problems.length ? <span className="text-sindoor">{r.problems.join("; ")}, will skip</span> : <span className="text-[#2f5d3a]">OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} onClick={() => modeRef.current && (modeRef.current.value = "preview")} className="rounded-full border border-sand bg-white px-5 py-2.5 font-semibold text-ink disabled:opacity-60">
          {state.rows ? "Check again" : "Check rows"}
        </button>
        {state.rows && ok > 0 && (
          <button disabled={pending} onClick={() => modeRef.current && (modeRef.current.value = "import")} className="rounded-full bg-sindoor px-5 py-2.5 font-semibold text-ivory disabled:opacity-60">
            {pending ? "Adding…" : `Add ${ok} household${ok === 1 ? "" : "s"}`}
          </button>
        )}
      </div>
    </form>
  );
}
