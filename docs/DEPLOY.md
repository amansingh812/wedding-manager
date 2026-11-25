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
   | `SUPABASE_URL` | Text | `https://uzmzuwcpykegddokhybd.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | from Supabase |
   | `SITE_URL` | Text | `https://wedding-manager.amanpd0.workers.dev` |
   | `SHOW_DEMO_LINKS` | Text | `1` while testing, `0` before sending invites |
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


## Family login (Phase 3)
- Cloudflare → wedding-manager → Settings → Variables: add `SUPABASE_PUBLISHABLE_KEY` (the `sb_publishable_…` key; it is safe to be public).
- Supabase → Auth → URL Configuration: Site URL = the site, redirect = `<site>/auth/callback` (done).
- Migration `0004_member_invites.sql`; first admin = amanpd0@gmail.com.
