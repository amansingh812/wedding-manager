# Deploy — Supabase + Cloudflare Workers

Hosting: **Cloudflare Workers** (free plan) via the OpenNext adapter. Vercel is paused until 20 Dec; this replaces it.
Database: **Supabase** (free plan).

Checked: compressed worker is ~1.1 MiB (free limit 3 MiB); all e2e tests pass on the Cloudflare runtime (`wrangler dev`).

---

## Step 1 — Supabase (≈10 min)

1. Sign in at https://supabase.com → **New project**
   - Name: `wedding-manager` · Region: **Mumbai (ap-south-1)** (closest to Nepal) · save the database password somewhere safe.
2. Open **SQL Editor** → New query → paste and **Run**, in this order:
   1. `supabase/migrations/0001_init.sql`
   2. `supabase/migrations/0002_invite_functions.sql`
   3. `supabase/seed.sql` (demo wedding + 3 demo households — editable later)
3. **Project Settings → API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY` (**secret — never share in chat or commit**)

## Step 2 — Cloudflare Workers (≈10 min)

1. Sign in at https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Import a repository** → connect GitHub → pick `amansingh812/wedding-manager`.
2. Build settings:
   - Build command: `npx opennextjs-cloudflare build`
   - Deploy command: `npx opennextjs-cloudflare deploy`
   - Root directory: `/`
3. **Variables and secrets** (Settings → Variables and Secrets), add for both build and runtime:
   | Name | Type | Value |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Text | from Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Text | from Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | from Supabase |
   | `NEXT_PUBLIC_SITE_URL` | Text | `https://wedding-manager.<your-subdomain>.workers.dev` |
   | `NEXT_PUBLIC_SHOW_DEMO_LINKS` | Text | `1` while testing, `0` before sending invites |
4. Deploy. Every push to `main` redeploys automatically.

Test: open `https://wedding-manager.<your-subdomain>.workers.dev/invite/sharma-parivar-9k4m2x` on your phone.

## Local commands

```bash
npm run dev          # normal Next.js dev (demo data unless .env.local has Supabase keys)
npm run cf:preview   # build + run on the real Cloudflare runtime locally
npm run cf:deploy    # manual deploy (needs `npx wrangler login` once)
```

## Free-plan limits to know

- 100,000 requests/day — far above what a wedding needs.
- 10 ms CPU per request — fine today; watch the Cloudflare logs if pages ever error with 1102.
- Images are served as-is (pre-sized ≤ 1000 px); Cloudflare image resizing is a paid add-on, not used.
