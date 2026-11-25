import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { authConfigured, getMembership } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Family sign in" };

const ERRORS: Record<string, string> = {
  expired: "That link has expired or was already used. Ask for a new one.",
  link: "That sign-in link wasn't complete. Ask for a new one.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (authConfigured()) {
    const { member } = await getMembership();
    if (member) redirect("/admin");
  }
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-svh max-w-[480px] flex-col justify-center bg-ivory px-6 py-12">
      <p lang="sa" className="text-center font-deva text-xl text-sindoor">॥ श्री गणेशाय नमः ॥</p>
      <h1 className="mt-4 text-center font-display text-4xl text-maroon">Family sign in</h1>
      <p className="mb-8 mt-2 text-center text-[15px] text-quiet">For family members helping with the wedding. We&apos;ll email you a link, no password needed.</p>
      {authConfigured() ? (
        <LoginForm initialError={error ? ERRORS[error] ?? ERRORS.link : undefined} />
      ) : (
        <p className="rounded-2xl bg-cream p-5 text-center text-sm text-muted">Login isn&apos;t set up on this server yet.</p>
      )}
    </main>
  );
}
