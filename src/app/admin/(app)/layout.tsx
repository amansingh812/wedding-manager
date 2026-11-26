import AdminNav from "@/components/admin/AdminNav";
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
    <div className="admin min-h-svh bg-[#F6EFE2] lg:flex">
      <AdminNav
        title={member.weddingTitle}
        signOutSlot={
          <form action={signOut}>
            <button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm text-[#D9BE86] transition-colors hover:bg-[rgba(243,217,155,.10)] hover:text-[#FFF7E8]">
              Sign out <span className="truncate text-xs opacity-70">{member.email}</span>
            </button>
          </form>
        }
      />
      <main className="min-w-0 flex-1 px-5 pb-12 pt-7 sm:px-8">
        <div className="mx-auto max-w-[1080px]">{children}</div>
        <form action={signOut} className="mt-10 text-center lg:hidden"><button className="text-sm text-quiet hover:text-sindoor">Sign out</button></form>
      </main>
    </div>
  );
}
