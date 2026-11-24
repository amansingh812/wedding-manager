# Progress log

Newest first. Each session: what was done, what's next, anything blocked.
The phase/stage checklist lives in [`ROADMAP.md`](./ROADMAP.md).

---

## ▶ Resume here

**Next up:** Phase 2 — connect Supabase.
1. User creates a Supabase project (free tier) and shares the project URL + anon key + service role key (put them in Vercel / `.env.local`, never in git).
2. Run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql` in the Supabase SQL editor.
3. Add `src/lib/data/supabase-store.ts` implementing `InviteStore`; switch in `getStore()` when env vars exist.
4. Deploy a preview to Vercel (user signs in) so the family can test on real phones.

**Blocked on user:** create empty private GitHub repo `amansingh812/wedding-manager`, then Claude pushes.

---

## 2026-11-24 (evening) — Shree Ganesh in the invitation

**Done** (replaces the earlier pre-door intro, per family feedback)
- Sealed doors → doors-open clip → **Lord Ganesh revealed inside the courtyard** with a golden glow and "॥ श्री गणेशाय नमः ॥" (~2.8 s, tap to move on).
- Ganesh **stays in the background**; the invitation card (household name, couple, date, places) rises over the lower half so he remains visible above it.
- **Closing blessing** at the end of the ceremonies page: Mithila-painted Ganesh with the Vakratunda shloka.
- **Home page** now opens with the brass Ganesh idol and "॥ श्री गणेशाय नमः ॥" (carry into the Phase 5 home page).
- New image: `public/images/ganesh-courtyard.jpg`. Removed `GaneshIntro.tsx`.
- E2E updated (reveal, card, closing blessing); all 5 pass.

---

## 2026-11-24 — Phase 0 + Phase 1

**Done**
- Project scaffold: Next.js 15 (App Router), TypeScript, Tailwind v4, Framer Motion, self-hosted fonts (Cormorant Garamond, Manrope, Noto Serif Devanagari).
- Code is couple-agnostic: names, dates, places live in data (`weddings` / `events` tables; demo copy in `src/lib/data/seed.ts`).
- Supabase migration `0001_init.sql`: 10 tables (incl. checklists), 3 views, RLS with `is_member` / `is_admin` helpers. Verified with seed on local Postgres; view counts correct.
- Guest invitation at `/invite/[slug]`: sealed doors (looping video) → doors-open clip → welcome card → only-invited ceremony cards (BS/AD, maps, dress colours, per-ceremony `.ics`) → RSVP (attend / not, headcount ≤ max, veg meals, blessing) → thank-you with summary, edit, save dates.
- Rules: RSVP lock after deadline (Nepal time), returning guests skip doors (cookie or saved RSVP), link-preview bots don't count as opens, invalid link page, reduced-motion support, OG preview "Special invitation for {household}".
- Security headers: `Referrer-Policy: same-origin` (slug never leaks to Maps etc.), `X-Robots-Tag: noindex` on invites, no framing.
- Tests: 10 unit tests (rules, dates, ics), 5 Playwright end-to-end tests on a Pixel 7 viewport. CI workflow runs lint, typecheck, unit, build, e2e.

**Manual test findings (fixed)**
- Stale "Please choose…" error stayed after answering → now clears on any change.
- Display font showed "1" like "I" in counters → lining numerals.

**Code review findings (fixed)**
- Slug could leak via Referer header → same-origin referrer policy.
- Returning guests briefly saw doors before skipping → server reads a cookie, no flash.
- Heading order h1 → h3 on ceremony cards → h2.

**Known / deferred**
- Mock store is in-memory: RSVPs reset on server restart. Replaced by Supabase in Phase 2.
- No rate limiting yet (Phase 2.4).
- Music button hidden until a licensed shehnai / panche baja track is chosen (`site.musicSrc`).
- Ceremony dates other than Bibah and venue names are placeholders in seed data.
