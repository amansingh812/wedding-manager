import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/admin/actions";
import { authConfigured, getMembership } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!authConfigured()) redirect("/admin/login");
  const { email, member } = await getMembership();
  if (!email) redirect("/admin/login");

  if (!member) {
    return (
      <main className="mx-auto flex min-h-svh max-w-[480px] flex-col justify-center bg-ivory px-6 text-center">
        <h1 className="font-display text-3xl text-maroon">Not on the family list yet</h1>
        <p className="mt-3 text-[15px] text-quiet">
          You&apos;re signed in as <b>{email}</b>, but this email hasn&apos;t been added. Ask an admin to add it, then sign in again.
        </p>
        <form action={signOut} className="mt-8">
          <button className="rounded-full border border-sand px-5 py-3 font-semibold text-ink">Sign out</button>
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-svh bg-ivory">
      <header className="sticky top-0 z-10 border-b border-sand/70 bg-ivory/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <Link href="/admin" className="font-display text-xl text-maroon">{member.weddingTitle}</Link>
          <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm font-semibold text-muted">
            <Link href="/admin/guests" className="hover:text-sindoor">Guests</Link>
            <Link href="/admin/matrix" className="hover:text-sindoor">Grid</Link>
            <Link href="/admin/send" className="hover:text-sindoor">Send</Link>
            <Link href="/admin/ceremonies" className="hover:text-sindoor">Ceremonies</Link>
            <Link href="/admin/checklists" className="hover:text-sindoor">Checklists</Link>
            <Link href="/admin/expenses" className="hover:text-sindoor">Expenses</Link>
            <Link href="/admin/members" className="hover:text-sindoor">Family</Link>
            <Link href="/" className="hover:text-sindoor">View site ↗</Link>
            <form action={signOut}><button className="hover:text-sindoor">Sign out</button></form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8">{children}</main>
    </div>
  );
}
