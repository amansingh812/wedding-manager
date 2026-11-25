import { usingSupabase } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/** Which data source is live. Never returns key values. */
export async function GET() {
  return Response.json({
    store: usingSupabase() ? "supabase" : "demo",
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
}
