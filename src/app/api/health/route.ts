import { usingSupabase } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/** Public uptime check. Deliberately reveals nothing about configuration or data. */
export async function GET() {
  return Response.json({ ok: true, db: usingSupabase() }, { headers: { "Cache-Control": "no-store" } });
}
