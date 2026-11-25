import { getCloudflareContext } from "@opennextjs/cloudflare";

type Limiter = { limit(opts: { key: string }): Promise<{ success: boolean }> };
export type LimitName = "INVITE_LIMITER" | "RSVP_LIMITER";

/** Client IP as Cloudflare reports it; falls back for local dev. */
export function clientIp(h: Headers): string {
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

/**
 * True if the request is allowed. Uses Cloudflare's rate-limiting binding when deployed;
 * when the binding isn't there (local dev, tests) it always allows.
 */
export async function allow(name: LimitName, key: string): Promise<boolean> {
  try {
    const env = getCloudflareContext().env as unknown as Record<string, Limiter | undefined>;
    const limiter = env[name];
    if (!limiter) return true;
    return (await limiter.limit({ key })).success;
  } catch {
    return true; // never block guests because the limiter itself failed
  }
}
