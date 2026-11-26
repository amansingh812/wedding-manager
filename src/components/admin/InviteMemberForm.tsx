"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { inviteMember, type FormState } from "@/app/admin/actions";

const field = "w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 text-[16px] outline-none focus:border-gold";

export default function InviteMemberForm({ listKey }: { listKey: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(inviteMember, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state]);
  const [shownFor, setShownFor] = useState(listKey);
  useEffect(() => { setShownFor(listKey); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  const stale = shownFor !== listKey && !state.error; // list changed since (e.g. a removal): hide old note
  return (
    <form ref={ref} action={action} className="grid gap-3 rounded-2xl border border-sand bg-white p-5 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
      <label><span className="mb-1 block text-xs font-semibold text-muted">Name</span><input name="name" required maxLength={80} className={field} /></label>
      <label><span className="mb-1 block text-xs font-semibold text-muted">Email</span><input name="email" type="email" required className={field} /></label>
      <label><span className="mb-1 block text-xs font-semibold text-muted">Role</span>
        <select name="role" defaultValue="family" className={field}><option value="family">Family</option><option value="admin">Admin</option></select>
      </label>
      <button disabled={pending} className="rounded-full bg-sindoor px-5 py-2.5 font-semibold text-ivory disabled:opacity-60">{pending ? "Adding…" : "Add"}</button>
      {(state.error || state.message) && !stale && (
        <p role="status" className={`sm:col-span-4 text-sm ${state.error ? "text-sindoor" : "text-muted"}`}>{state.error ?? state.message}</p>
      )}
    </form>
  );
}
