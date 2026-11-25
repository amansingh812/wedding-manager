import { getStore } from "@/lib/data/store";
import { buildIcs } from "@/lib/ics";
import { allow, clientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await allow("INVITE_LIMITER", clientIp(req.headers)))) {
    return new Response("Too many requests", { status: 429, headers: { "Retry-After": "60" } });
  }
  const { slug } = await params;
  const view = await getStore().getInvite(slug);
  if (!view) return new Response("Not found", { status: 404 });
  // ?event=<id> → one ceremony; otherwise all ceremonies this household is invited to
  const only = new URL(req.url).searchParams.get("event");
  const ceremonies = only ? view.ceremonies.filter((c) => c.id === only) : view.ceremonies;
  if (ceremonies.length === 0) return new Response("Not found", { status: 404 });
  return new Response(buildIcs(view.wedding, ceremonies), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="wedding-ceremonies.ics"',
      "Cache-Control": "private, no-store",
    },
  });
}
