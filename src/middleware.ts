import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Keeps the family login session fresh on admin pages. Guest invite pages are untouched. */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return res;
  const sb = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
    },
  });
  await sb.auth.getUser();
  return res;
}

export const config = { matcher: ["/admin/:path*"] };
