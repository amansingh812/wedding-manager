import { createClient } from "@supabase/supabase-js";

export type LimitName = "INVITE_LIMITER" | "RSVP_LIMITER";

/** Per-IP limits: invite opens + calendar 60/min; RSVP and login 10/min. */
const LIMITS: Record<LimitName, { limit: number; windowSeconds: number }> = {
  INVITE_LIMITER: { limit: 60, windowSeconds: 60 },
  RSVP_LIMITER: { limit: 10, windowSeconds: 60 },
};

/** Client IP as Cloudflare reports it; falls back for local dev. */
export function clientIp(h: Headers): string {
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

/**
 * True if the request is allowed. Counted in Postgres (hit_rate_limit), so it is exact across
 * Cloudflare locations. Without the database configured (local dev, tests) it always allows,
 * and it never blocks guests because the limiter itself failed.
 */
export async function allow(name: LimitName, key: string): Promise<boolean> {
  const url = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) return true;
  try {
    const sb = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
    const { limit, windowSeconds } = LIMITS[name];
    const { data, error } = await sb.rpc("hit_rate_limit", { p_key: `${name}:${key}`, p_limit: limit, p_window_seconds: windowSeconds });
    if (error) {
      console.error("rate limit", error.message);
      return true;
    }
    return data !== false;
  } catch (e) {
    console.error("rate limit failed", e);
    return true;
  }
}
