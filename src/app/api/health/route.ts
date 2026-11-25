import { getStore, usingSupabase } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/** Which data source is live, and whether a demo invite loads. Never returns key values. */
export async function GET() {
  let invite: string;
  try {
    const v = await getStore().getInvite("sharma-parivar-9k4m2x");
    invite = v ? `ok (${v.ceremonies.length} ceremonies)` : "not found";
  } catch (e) {
    const err = e as { message?: string; code?: string; details?: string; hint?: string };
    invite = `error: ${[err.code, err.message, err.details, err.hint].filter(Boolean).join(" | ")}`;
  }
  return Response.json({
    store: usingSupabase() ? "supabase" : "demo",
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    invite,
  });
}
