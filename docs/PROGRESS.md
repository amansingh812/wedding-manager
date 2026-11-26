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

## 2026-11-24 (night) — Opening always plays

**Fixed** (family testing: "after invite it jumps straight to Your ceremonies")
- Cause: the returning-guest rule skipped the doors once the link had been opened or answered, so re-testing the same link never showed the opening again.
- Now the full opening (doors with the family name → doors open → Ganesh → invitation card) plays on **every** visit.
- Returning guests get a **Skip to my ceremonies** link under the seal; the ceremonies page has **Watch the invitation again**.
- Verified in a real Chromium on the dev server (screen recording) and with a new e2e test; 6/6 pass.

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

## 2026-11-25 — Phase 2 live
- Cloudflare Workers deploys from GitHub on every push to main.
- Live: https://wedding-manager.amanpd0.workers.dev — reads Supabase (`/api/health` → store: supabase, invite ok).
- Fix: new Supabase projects don't grant table access to service_role → migration `0003_service_role_grants.sql` (applied).
- Verified: opening /invite/jha-family-p7q2wd set open_count = 1 in Supabase.
- Next: 2.4 rate limits, then Phase 3 (admin login, guests, WhatsApp send).

## 2026-11-25 — Manual test: rate limits + family login
- Pass: /admin and /admin/members redirect to /admin/login when signed out; /auth/callback without code → login?error=link; admin pages send noindex + no-store; invite, calendar, 404 still fine.
- Fail: Cloudflare rate-limit binding is attached but never returned "limited" (150 sequential, 200 parallel, fixed key). Logged as 2.4 🟡.
- Blocked: sign-in flow needs SUPABASE_PUBLISHABLE_KEY in Cloudflare variables (user).

## 2026-11-25 — Code review fixes (Phase 3.1)
- Critical: magic links only go to emails on the family list (`login_allowed`, migration 0005, applied). Strangers get the same reply but no email and no account.
- Membership lookup cached per request (was 2–3 Supabase calls per page).
- Checked: dashboard views use security_invoker; every table has RLS policies; secret key only on server.

## 2026-11-25 — Phase 3.2 ceremony editor
- /admin/ceremonies list (Published/Draft, missing-field hints) and /admin/ceremonies/[id] form (validated: times, https map link, hex colours). Admin-only writes, also enforced by RLS.
- Live test blocked on SUPABASE_PUBLISHABLE_KEY (login).

## 2026-11-26 — Live test: login, family, ceremonies (all pass)
- Magic link to amanpd0@gmail.com → admin home "Namaste, Aman / Admin". Stranger email → same reply, no link.
- Family: added Test Cousin (email lowercased, "hasn't signed in yet"), removed. Fixed: success note lingered after removal.
- Ceremonies: http map link rejected with message; Reception 18:00→18:30 showed on /invite/office-… immediately; restored to 18:00.
- Fixed: form lost all typed values after a validation error (React resets forms) — now refills.
- Not tested: sign out (would end the user's session); family-role read-only view (needs a 2nd account).

## 2026-11-26 — Phase 3.3 guest list (live-tested)
- Paste import: header skipped; "981-234 5678" → +9779812345678, "+91 70123 45678" → +917012345678; duplicate "Jha Family" and bad row (phone 12345, side "uncle") skipped with reasons; 2 added with the chosen 5 ceremonies.
- Edit: bad phone rejected, typed values + ticks kept. New invite link rendered its ceremonies. Two-step remove; removed link → 404. Test rows cleaned up.
- 7 new unit tests (phone, side, slug, paste parsing) — 17 total.
- Not covered by 3.3: the all-households × ceremonies grid (3.4).

## 2026-11-26 — Phase 3.4 + 3.5 (live-tested) — Phase 3 complete
- Grid: ticked Office→Mehendi, survived reload; shortcut "Remove both/friends from Mehendi" undid it and grid refreshed. Fixed: shortcut note vanished on refresh.
- Send: message preview fills {link}; "Copy message" (no phone) marked Office sent, filter moved it. WhatsApp button builds wa.me (unit-tested); not clicked live, to avoid messaging a real number.
- Demo data note: Office – Tech Team now shows "sent".
