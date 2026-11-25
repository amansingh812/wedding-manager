import type { Metadata } from "next";
import Link from "next/link";
import { getMembership } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Wedding admin" };

const SECTIONS = [
  { title: "Family", body: "Who can sign in and help", href: "/admin/members", ready: true },
  { title: "Ceremonies", body: "Dates, venues, dress colours", href: "/admin/ceremonies", ready: true },
  { title: "Guests", body: "Households and who's invited where", ready: false },
  { title: "Send invites", body: "WhatsApp links and status", ready: false },
];

export default async function AdminHome() {
  const { member } = await getMembership();
  return (
    <>
      <h1 className="font-display text-4xl text-maroon">Namaste, {member?.name.split(" ")[0]}</h1>
      <p className="mt-1 text-quiet">{member?.role === "admin" ? "Admin" : "Family member"}</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {SECTIONS.map((s) =>
          s.ready && s.href ? (
            <Link key={s.title} href={s.href} className="rounded-2xl border border-sand bg-white p-5 transition hover:border-gold">
              <h2 className="font-display text-2xl text-maroon">{s.title}</h2>
              <p className="text-sm text-quiet">{s.body}</p>
            </Link>
          ) : (
            <div key={s.title} className="rounded-2xl border border-dashed border-sand p-5 opacity-60">
              <h2 className="font-display text-2xl text-maroon">{s.title}</h2>
              <p className="text-sm text-quiet">{s.body} · coming next</p>
            </div>
          ),
        )}
      </div>
    </>
  );
}
