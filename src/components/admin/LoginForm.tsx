"use client";

import { useActionState } from "react";
import { sendMagicLink, type FormState } from "@/app/admin/actions";

export default function LoginForm({ initialError }: { initialError?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(sendMagicLink, { error: initialError });
  if (state.ok) {
    return <p role="status" className="rounded-2xl bg-cream p-5 text-[15px] leading-relaxed text-ink">{state.message}</p>;
  }
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-muted">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          className="w-full rounded-xl border border-sand bg-white px-4 py-3 text-[16px] text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
        />
      </label>
      {state.error && <p role="alert" className="text-sm text-sindoor">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-full bg-sindoor px-5 py-3.5 font-semibold text-ivory transition hover:bg-sindoor-dark disabled:opacity-60"
      >
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
