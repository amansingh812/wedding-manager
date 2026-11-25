# Wedding Manager

A private web app for a family wedding: personal animated invitations sent on WhatsApp, zero-login RSVPs, and a family dashboard for guests, ceremony checklists and expenses.

Nothing couple-specific is hard-coded. Names, dates, places and wording come from the database (`weddings`, `events`), so they can be edited without a deploy.

- **Project status (start here):** [`STATUS.md`](STATUS.md)
- **Status and next steps:** [`docs/ROADMAP.md`](docs/ROADMAP.md) · [`docs/PROGRESS.md`](docs/PROGRESS.md)
- **Product requirements:** https://claude.ai/artifact/M6rMrSuEuFmHDEZqeAVPkA
- **System design & database:** https://claude.ai/artifact/FJ8ZZJgwfyCZ4BWjCX9CgL
- **Approved designs:** https://claude.ai/artifact/RKN8872exjPiWVnbygMDuR

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Supabase (Postgres, Auth, Storage) · Vercel

## Run it locally

```bash
npm install
cp .env.example .env.local   # optional until Supabase is connected
npm run dev
```

Open http://localhost:3000. In development the home page lists demo invitation links, for example:

- http://localhost:3000/invite/sharma-parivar-9k4m2x (bride side, 4 ceremonies)
- http://localhost:3000/invite/jha-family-p7q2wd (groom side, 5 ceremonies)
- http://localhost:3000/invite/office-tech-team-c3n8vr (Reception only)

Without Supabase env vars the app uses an in-memory demo store: RSVPs work but reset when the server restarts.

## Checks

```bash
npm run check        # lint + typecheck + unit tests
npm run build
npm run test:e2e     # Playwright, phone viewport (needs: npx playwright install chromium)
```

## Project layout

```
src/app/invite/[slug]/     guest invitation page, RSVP server action, .ics route
src/components/invite/     doors, welcome card, ceremony cards, RSVP form, thank-you
src/lib/rsvp.ts            product rules (headcount caps, veg cap, deadline lock, bot detection)
src/lib/data/              store interface, in-memory demo store, demo seed data
supabase/migrations/       database schema, views, row-level security
supabase/seed.sql          demo wedding for a fresh database
tests/e2e/                 Playwright walkthrough of the guest journey
docs/                      roadmap and progress log
```

## Privacy

Guests reach only their own household through an unguessable link. Guest reads and writes happen on the server after the slug is checked; the browser never gets database keys that can list guests. Invite pages are `noindex` and send no referrer to other sites.
