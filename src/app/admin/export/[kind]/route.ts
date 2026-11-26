import { toCsv } from "@/lib/csv";
import { site } from "@/config/site";
import { createAuthClient, getMembership } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const SIDE: Record<string, string> = { groom: "Groom", bride: "Bride", common: "Both" };

export async function GET(_: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { member } = await getMembership();
  if (!member) return new Response("Please sign in", { status: 401 });
  const { kind } = await params;
  const sb = await createAuthClient();
  const { data: es } = await sb.from("events").select("id, name").eq("wedding_id", member.weddingId).order("sort_order");
  const events = (es ?? []) as { id: string; name: string }[];
  const eventName = new Map(events.map((e) => [e.id, e.name]));
  let csv: string;

  if (kind === "guests") {
    const { data } = await sb.from("households").select("display_name, contact_name, phone_e164, side, group_tag, max_guests, slug, sent_at, open_count, notes, invitations(event_id)").eq("wedding_id", member.weddingId).order("display_name");
    const base = process.env.SITE_URL || site.url || "";
    csv = toCsv(
      ["Household", "Contact", "Phone", "Side", "Group", "Max guests", ...events.map((e) => e.name), "Invite link", "Sent", "Opened (times)", "Notes"],
      (data ?? []).map((h) => {
        const inv = new Set((h.invitations as { event_id: string }[]).map((i) => i.event_id));
        return [h.display_name, h.contact_name, h.phone_e164, SIDE[h.side as string], h.group_tag, h.max_guests, ...events.map((e) => (inv.has(e.id) ? "Yes" : "")),
          `${base}/invite/${h.slug}`, h.sent_at ? String(h.sent_at).slice(0, 10) : "", h.open_count, h.notes];
      }),
    );
  } else if (kind === "expenses") {
    const { data } = await sb.from("expenses").select("title, event_id, vendor_name, vendor_phone, total_amount, paid_amount, balance, notes, created_at").eq("wedding_id", member.weddingId).order("created_at");
    csv = toCsv(
      ["What for", "Ceremony", "Vendor", "Vendor phone", "Total (NPR)", "Paid (NPR)", "Balance (NPR)", "Notes", "Added"],
      (data ?? []).map((x) => [x.title, x.event_id ? eventName.get(x.event_id) ?? "" : "General", x.vendor_name, x.vendor_phone, Number(x.total_amount), Number(x.paid_amount), Number(x.balance), x.notes, String(x.created_at).slice(0, 10)]),
    );
  } else if (kind === "checklist") {
    const [{ data }, { data: ms }] = await Promise.all([
      sb.from("checklist_items").select("title, kind, event_id, group_name, quantity, owner_id, due_date, status, notes").eq("wedding_id", member.weddingId).order("event_id").order("sort_order"),
      sb.from("members").select("user_id, name").eq("wedding_id", member.weddingId),
    ]);
    const owner = new Map((ms ?? []).map((m) => [m.user_id as string, m.name as string]));
    csv = toCsv(
      ["Ceremony", "Group", "Item", "Type", "Qty", "Who", "Due", "Status", "Notes"],
      (data ?? []).map((i) => [i.event_id ? eventName.get(i.event_id) ?? "" : "General", i.group_name, i.title, i.kind, i.quantity, i.owner_id ? owner.get(i.owner_id) ?? "" : "", i.due_date, i.status === "done" ? "Done" : "To do", i.notes]),
    );
  } else {
    return new Response("Not found", { status: 404 });
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="wedding-${kind}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
