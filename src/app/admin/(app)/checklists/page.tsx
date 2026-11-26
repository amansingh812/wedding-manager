import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AddItemForm, ItemRow, StarterButton, type Item } from "@/components/admin/ChecklistUI";
import { createAuthClient, getMembership } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Checklists" };

type Row = {
  id: string; title: string; kind: Item["kind"]; group_name: string | null; quantity: string | null; owner_id: string | null;
  due_date: string | null; status: string; event_id: string | null; sort_order: number;
};

export default async function ChecklistsPage({ searchParams }: { searchParams: Promise<{ event?: string; view?: string }> }) {
  const { member } = await getMembership();
  if (!member) return null;
  const { event = "all", view = "all" } = await searchParams;
  const sb = await createAuthClient();
  const { data: { user } } = await sb.auth.getUser();
  const today = new Date(Date.now() + (5 * 60 + 45) * 60_000).toISOString().slice(0, 10);
  const [{ data: es }, { data: ms }, { data: items }] = await Promise.all([
    sb.from("events").select("id, name, kind, image_path").eq("wedding_id", member.weddingId).order("sort_order"),
    sb.from("members").select("user_id, name").eq("wedding_id", member.weddingId).order("name"),
    sb.from("checklist_items").select("id, title, kind, group_name, quantity, owner_id, due_date, status, event_id, sort_order").eq("wedding_id", member.weddingId).order("sort_order").order("created_at"),
  ]);
  const events = (es ?? []).map((e) => ({ id: e.id as string, name: e.name as string, img: e.image_path as string | null }));
  const members = (ms ?? []).map((m) => ({ id: m.user_id as string, name: m.name as string }));
  const memberName = new Map(members.map((m) => [m.id, m.name]));
  const eventName = new Map(events.map((e) => [e.id, e.name]));
  const all = (items as Row[] | null) ?? [];

  const selected = events.find((e) => e.id === event) ?? null;
  const filtered = all.filter((r) => {
    if (event === "general" && r.event_id) return false;
    if (selected && r.event_id !== selected.id) return false;
    if (view === "mine" && r.owner_id !== user?.id) return false;
    if (view === "overdue" && !(r.status !== "done" && r.due_date && r.due_date < today)) return false;
    return true;
  });
  const toItem = (r: Row): Item => ({
    id: r.id, title: r.title, kind: r.kind, group: r.group_name, qty: r.quantity, ownerName: r.owner_id ? memberName.get(r.owner_id) ?? null : null,
    due: r.due_date, done: r.status === "done", eventName: !selected && r.event_id ? eventName.get(r.event_id) ?? null : null,
  });
  // open items first, grouped; done items at the end
  const open = filtered.filter((r) => r.status !== "done");
  const done = filtered.filter((r) => r.status === "done");
  const groups = new Map<string, Row[]>();
  for (const r of open) groups.set(r.group_name ?? "Other", [...(groups.get(r.group_name ?? "Other") ?? []), r]);

  const progress = (id: string | null) => {
    const list = all.filter((r) => (id === null ? true : r.event_id === id));
    return { done: list.filter((r) => r.status === "done").length, total: list.length };
  };
  const qs = (p: Record<string, string>) => `/admin/checklists?${new URLSearchParams({ event, view, ...p })}`;
  const overdueCount = all.filter((r) => r.status !== "done" && r.due_date && r.due_date < today).length;
  const isAdmin = member.role === "admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-maroon">Checklists</h1>
        <p className="mt-1 text-quiet">Samagri to buy, things to bring, bookings and to-dos for each ceremony.</p>
      </div>

      {/* Ceremony chips with progress */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {[{ id: "all", name: "All", img: null as string | null }, ...events, { id: "general", name: "General", img: null }].map((e) => {
          const p = e.id === "all" ? progress(null) : e.id === "general" ? { done: all.filter((r) => !r.event_id && r.status === "done").length, total: all.filter((r) => !r.event_id).length } : progress(e.id);
          const active = event === e.id;
          return (
            <Link key={e.id} href={qs({ event: e.id })} className={`flex shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-sm font-semibold ${active ? "border-sindoor bg-sindoor text-ivory" : "border-sand bg-white text-ink"}`}>
              {e.img ? <Image src={e.img} alt="" width={28} height={28} className="size-7 rounded-full object-cover" /> : <span className="size-7 rounded-full bg-cream" />}
              {e.name}
              {p.total > 0 && <span className={`text-xs ${active ? "text-ivory/80" : "text-quiet"}`}>{p.done}/{p.total}</span>}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {[["all", "Everything"], ["mine", "My items"], ["overdue", `Overdue${overdueCount ? ` (${overdueCount})` : ""}`]].map(([k, l]) => (
          <Link key={k} href={qs({ view: k })} className={`rounded-full px-3 py-1 font-semibold ${view === k ? "bg-ink text-ivory" : "text-muted hover:text-ink"}`}>{l}</Link>
        ))}
      </div>

      <AddItemForm events={events} members={members} eventId={selected?.id ?? null} />
      {selected && <StarterButton eventId={selected.id} eventName={selected.name} />}

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-quiet">
          {view === "all" ? (selected ? `Nothing on the ${selected.name} list yet. Add items above, or use the starter list.` : "Nothing yet. Pick a ceremony to add its starter list.") : "Nothing here."}
        </p>
      ) : (
        <div className="space-y-4">
          {[...groups.entries()].map(([g, rows]) => (
            <section key={g}>
              <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{g}</h2>
              <ul className="divide-y divide-sand/60 rounded-2xl border border-sand bg-white">{rows.map((r) => <ItemRow key={r.id} item={toItem(r)} today={today} canDelete={isAdmin} />)}</ul>
            </section>
          ))}
          {done.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted">Done ({done.length})</summary>
              <ul className="mt-1.5 divide-y divide-sand/60 rounded-2xl border border-sand bg-white">{done.map((r) => <ItemRow key={r.id} item={toItem(r)} today={today} canDelete={isAdmin} />)}</ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
