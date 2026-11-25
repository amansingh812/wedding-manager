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
  } catch (e) {
    console.error("rate limiter failed", e);
    return true; // never block guests because the limiter itself failed
  }
}

/** For /api/health: is the binding reachable, and what IP does the worker see? */
export async function limiterStatus(h: Headers): Promise<string> {
  try {
    const env = getCloudflareContext().env as unknown as Record<string, Limiter | undefined>;
    if (!env.INVITE_LIMITER) return "no binding";
    const ip = clientIp(h);
    return `bound; ip=${ip.replace(/[\d]+$/, "x")}`;
  } catch (e) {
    return `context error: ${(e as Error).message}`;
  }
}
