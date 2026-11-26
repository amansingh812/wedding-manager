import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { npr } from "@/lib/money";
import { createAuthClient, getMembership } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Expenses" };

type Row = { id: string; title: string; event_id: string | null; vendor_name: string | null; total_amount: number; paid_amount: number; balance: number };

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const { member } = await getMembership();
  if (!member) return null;
  const { saved, deleted } = await searchParams;
  const sb = await createAuthClient();
  const [{ data: es }, { data: xs }] = await Promise.all([
    sb.from("events").select("id, name").eq("wedding_id", member.weddingId).order("sort_order"),
    sb.from("expenses").select("id, title, event_id, vendor_name, total_amount, paid_amount, balance").eq("wedding_id", member.weddingId).order("created_at", { ascending: false }),
  ]);
  const rows = ((xs as Row[] | null) ?? []).map((r) => ({ ...r, total_amount: Number(r.total_amount), paid_amount: Number(r.paid_amount), balance: Number(r.balance) }));
  const total = rows.reduce((n, r) => n + r.total_amount, 0);
  const paid = rows.reduce((n, r) => n + r.paid_amount, 0);
  const eventName = new Map((es ?? []).map((e) => [e.id as string, e.name as string]));
  const byEvent = [...new Set(rows.map((r) => r.event_id))].map((id) => {
    const list = rows.filter((r) => r.event_id === id);
    return { id, name: id ? eventName.get(id) ?? "Ceremony" : "General", total: list.reduce((n, r) => n + r.total_amount, 0), balance: list.reduce((n, r) => n + r.balance, 0), list };
  });
  const isAdmin = member.role === "admin";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-night px-6 py-7 text-ivory">
        <Image src="/images/reception.jpg" alt="" fill priority sizes="720px" className="object-cover object-[center_55%] opacity-70" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,11,16,.9),rgba(27,11,16,.35))]" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl">Expenses</h1>
            <p className="mt-1 text-ivory/80">What&apos;s booked, what&apos;s paid, what&apos;s still due.</p>
          </div>
          {isAdmin && <Link href="/admin/expenses/new" className="rounded-full bg-gold px-5 py-2.5 font-semibold text-night">Add expense</Link>}
        </div>
      </section>
      {saved && <p role="status" className="rounded-xl bg-cream px-4 py-2.5 text-sm text-muted">Saved.</p>}
      {deleted && <p role="status" className="rounded-xl bg-cream px-4 py-2.5 text-sm text-muted">Expense deleted.</p>}

      <div className="grid grid-cols-3 gap-3">
        {[{ l: "Total booked", n: total, t: "text-ink" }, { l: "Paid", n: paid, t: "text-[#2f5d3a]" }, { l: "Still to pay", n: total - paid, t: "text-sindoor" }].map((k) => (
          <div key={k.l} className="rounded-2xl border border-sand bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{k.l}</p>
            <p className={`mt-1 font-display text-2xl sm:text-3xl ${k.t}`}>{npr(k.n)}</p>
          </div>
        ))}
      </div>
      {total > 0 && (
        <div className="h-2 overflow-hidden rounded-full bg-cream"><div className="h-full bg-[#2f5d3a]" style={{ width: `${Math.round((paid / total) * 100)}%` }} /></div>
      )}

      {rows.length === 0 ? (
        <p className="py-8 text-center text-quiet">{isAdmin ? "No expenses yet. Add the first booking: venue, caterer, band…" : "No expenses recorded yet."}</p>
      ) : (
        byEvent.map((g) => (
          <section key={g.id ?? "general"}>
            <div className="mb-1.5 flex items-baseline justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{g.name}</h2>
              <span className="text-xs text-quiet">{npr(g.total)}{g.balance > 0 && ` · ${npr(g.balance)} due`}</span>
            </div>
            <ul className="divide-y divide-sand/60 rounded-2xl border border-sand bg-white">
              {g.list.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/expenses/${r.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-ivory">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink">{r.title}</span>
                      {r.vendor_name && <span className="block text-xs text-quiet">{r.vendor_name}</span>}
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-semibold text-ink">{npr(r.total_amount)}</span>
                      <span className={`block text-xs ${r.balance > 0 ? "text-sindoor" : "text-[#2f5d3a]"}`}>{r.balance > 0 ? `${npr(r.balance)} due` : "Paid in full"}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
