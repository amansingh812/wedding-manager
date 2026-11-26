import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ExpenseForm, { type ExpenseData } from "@/components/admin/ExpenseForm";
import { createAuthClient, getMembership } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Expense" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { member } = await getMembership();
  if (!member) return null;
  const { id } = await params;
  const isAdmin = member.role === "admin";
  if (id === "new" ? !isAdmin : !UUID.test(id)) notFound();
  const sb = await createAuthClient();
  const { data: es } = await sb.from("events").select("id, name").eq("wedding_id", member.weddingId).order("sort_order");
  let expense: ExpenseData | null = null;
  if (id !== "new") {
    const { data: x } = await sb.from("expenses").select("*").eq("id", id).eq("wedding_id", member.weddingId).maybeSingle();
    if (!x) notFound();
    expense = { id: x.id, title: x.title, eventId: x.event_id, vendorName: x.vendor_name, vendorPhone: x.vendor_phone, total: Number(x.total_amount), paid: Number(x.paid_amount), notes: x.notes };
  }
  return (
    <>
      <h1 className="mb-6 font-display text-4xl text-maroon">{expense?.title ?? "New expense"}</h1>
      <ExpenseForm expense={expense} events={(es ?? []).map((e) => ({ id: e.id as string, name: e.name as string }))} readOnly={!isAdmin} />
    </>
  );
}
