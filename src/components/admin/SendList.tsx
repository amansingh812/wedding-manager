"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { markSent, saveInviteMessage } from "@/app/admin/invite-actions";
import type { FormState } from "@/app/admin/actions";
import { fillMessage, whatsappUrl } from "@/lib/guests";

export type SendRow = { id: string; name: string; phone: string | null; slug: string; sentAt: string | null; openCount: number; ceremonies: number };

function when(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Kathmandu" });
}

export default function SendList({ rows, template, siteUrl, isAdmin }: { rows: SendRow[]; template: string; siteUrl: string; isAdmin: boolean }) {
  const [message, setMessage] = useState(template);
  const [sent, setSent] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<"todo" | "all">("todo");
  const [state, action, pending] = useActionState<FormState, FormData>(saveInviteMessage, {});

  const sentAt = (r: SendRow) => sent[r.id] ?? r.sentAt;
  const reached = (r: SendRow) => Boolean(sentAt(r)) || r.openCount > 0; // opened = they got it
  const shown = rows.filter((r) => filter === "all" || !reached(r));
  const preview = fillMessage(message, rows[0]?.name ?? "Sharma Family", `${siteUrl}/invite/${rows[0]?.slug ?? "example"}`);

  async function send(r: SendRow) {
    const text = fillMessage(message, r.name, `${siteUrl}/invite/${r.slug}`);
    window.open(whatsappUrl(r.phone!, text), "_blank", "noopener");
    const res = await markSent(r.id);
    if (res.ok && res.sentAt) setSent((p) => ({ ...p, [r.id]: res.sentAt! }));
  }
  async function copy(r: SendRow) {
    await navigator.clipboard.writeText(fillMessage(message, r.name, `${siteUrl}/invite/${r.slug}`));
    setCopied(r.id);
    const res = await markSent(r.id);
    if (res.ok && res.sentAt) setSent((p) => ({ ...p, [r.id]: res.sentAt! }));
  }

  const done = rows.filter(reached).length;
  return (
    <div className="space-y-6">
      <form action={action} className="space-y-2 rounded-2xl border border-sand bg-white p-5">
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="msg">WhatsApp message</label>
        <textarea id="msg" name="message" rows={3} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} disabled={!isAdmin}
          className="w-full rounded-xl border border-sand px-3.5 py-2.5 text-[16px] outline-none focus:border-gold disabled:bg-cream/50" />
        <p className="text-xs text-quiet">{"{name}"} becomes the household name, {"{link}"} their personal invite link.</p>
        <div className="rounded-2xl bg-[#efe7dc] bg-[url('/images/mandala.webp')] bg-[length:160px] bg-blend-soft-light p-4">
          <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted">How guests see it on WhatsApp</p>
          <div className="ml-auto max-w-[320px] overflow-hidden rounded-xl rounded-tr-sm bg-[#d9fdd3] shadow-sm">
            <div className="m-1 overflow-hidden rounded-lg bg-white/70">
              <div className="relative aspect-[1200/630]"><Image src="/images/og.jpg" alt="" fill sizes="320px" className="object-cover" /></div>
              <div className="px-2.5 py-1.5">
                <p className="text-[13px] font-semibold text-ink">Special invitation for {rows[0]?.name ?? "your family"}</p>
                <p className="truncate text-[11px] text-quiet">{siteUrl.replace(/^https?:\/\//, "")}</p>
              </div>
            </div>
            <p className="whitespace-pre-line break-words px-2.5 pb-1 pt-0.5 text-[14px] leading-snug text-ink">{preview}</p>
            <p className="px-2.5 pb-1.5 text-right text-[10px] text-quiet">✓✓</p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <button disabled={pending} className="rounded-full border border-sand px-4 py-1.5 text-sm font-semibold text-ink">{pending ? "Saving…" : "Save message"}</button>
            {(state.message || state.error) && <span className={`text-sm ${state.error ? "text-sindoor" : "text-muted"}`}>{state.error ?? state.message}</span>}
          </div>
        )}
      </form>

      <div className="flex items-center justify-between">
        <p className="text-muted"><b className="text-ink">{done}</b> of {rows.length} sent</p>
        <div className="flex rounded-full border border-sand bg-white p-0.5 text-sm font-semibold">
          {(["todo", "all"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 ${filter === f ? "bg-sindoor text-ivory" : "text-muted"}`}>{f === "todo" ? "Not sent" : "All"}</button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="text-center text-quiet">{rows.length ? "Everyone has been sent their invite. 🎉" : "Add guests first."}</p>
      ) : (
        <ul className="divide-y divide-sand/70 rounded-2xl border border-sand bg-white">
          {shown.map((r) => {
            const s = sentAt(r);
            return (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <span className="min-w-0">
                  <Link href={`/admin/guests/${r.id}`} className="block truncate font-semibold text-ink hover:text-sindoor">{r.name}</Link>
                  <span className="block text-xs text-quiet">
                    {r.phone ?? "No phone"} · {r.ceremonies} ceremon{r.ceremonies === 1 ? "y" : "ies"}
                    {s && ` · sent ${when(s)}`}{r.openCount > 0 && ` · opened ${r.openCount}×`}
                    {r.ceremonies === 0 && " · ⚠ not invited to anything yet"}
                  </span>
                </span>
                {r.phone ? (
                  <button type="button" onClick={() => send(r)} disabled={r.ceremonies === 0}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-40 ${reached(r) ? "border border-sand bg-white text-ink" : "bg-[#1f7a4d] text-white"}`}>
                    {reached(r) ? "Resend" : "Send on WhatsApp"}
                  </button>
                ) : (
                  <button type="button" onClick={() => copy(r)} disabled={r.ceremonies === 0}
                    className="shrink-0 rounded-full border border-sand bg-white px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40">
                    {copied === r.id ? "Copied" : "Copy message"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
