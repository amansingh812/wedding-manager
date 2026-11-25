import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** True when family login is configured (publishable key present at runtime). */
export function authConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
}

/**
 * Supabase client acting as the signed-in family member (RLS applies).
 * Uses the publishable key; never the secret key.
 */
export async function createAuthClient() {
  const store = await cookies();
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // called from a Server Component: middleware refreshes the session instead
        }
      },
    },
  });
}

export type Membership = {
  weddingId: string;
  weddingTitle: string;
  name: string;
  role: "admin" | "family";
  email: string;
};

/** The signed-in user's membership, or null if signed out / not a member. */
export async function getMembership(): Promise<{ email: string | null; member: Membership | null }> {
  const sb = await createAuthClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { email: null, member: null };
  const { data } = await sb
    .from("members")
    .select("wedding_id, name, role, weddings(title)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!data) return { email: user.email ?? null, member: null };
  const w = data.weddings as unknown as { title: string } | null;
  return {
    email: user.email ?? null,
    member: {
      weddingId: data.wedding_id,
      weddingTitle: w?.title ?? "Wedding",
      name: data.name,
      role: data.role,
      email: user.email ?? "",
    },
  };
}
