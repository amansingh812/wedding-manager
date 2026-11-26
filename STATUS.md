# Project Status — Wedding Manager

_Last updated: 26 Nov 2026 (Phase 4 done: dashboard, checklists, expenses, CSV. Next: Phase 5 public home page)_

One page to see what's done, what's pending and what's waiting on someone.
Details per stage: [`docs/ROADMAP.md`](docs/ROADMAP.md) · session notes: [`docs/PROGRESS.md`](docs/PROGRESS.md)

## Overall

| Phase | What | Status |
|---|---|---|
| 0 | Project setup (code, database design, tests, GitHub) | ✅ Done |
| 1 | Guest invitation (doors → Ganesh → invitation card → ceremonies) | ✅ Done (RSVP hidden for now) |
| 2 | Connect Supabase + first online preview on **Cloudflare Workers** | 🟡 Code ready — **waiting on you** (see `docs/DEPLOY.md`) |
| 3 | Family admin: login, ceremonies, guest list, WhatsApp send | ⬜ Not started |
| 4 | Dashboard, ceremony checklists, expense ledger, CSV export | ⬜ Not started |
| 5 | Public home page (opens with Shree Ganesh) | ⬜ Not started |
| 6 | Launch: security, speed, domain, family test, send invites | ⬜ Not started |
| v2 | QR photo upload to Google Drive, photo gallery, auto reminders | ⏸ After the wedding |

## ✅ Done

- GitHub repo `amansingh812/wedding-manager` + copy in `Documents/GitHub/wedding-manager`
- Database design: 10 tables incl. ceremony checklists (tested on local Postgres)
- Invitation: sealed doors with family name → doors open → Lord Ganesh → invitation card over Ganesh → only their ceremonies (BS/AD dates, Maps, calendar, dress colours) → closing Ganesh blessing
- Opening plays every visit; returning guests get "Skip to my ceremonies"; "Watch the invitation again" button
- WhatsApp link preview, wrong-link page, privacy headers
- Home page placeholder with Shree Ganesh
- Automated tests: 10 unit + 6 browser tests, run on every push

## 🟡 Pending — next up (Phase 2)

- [x] Hosting moved to Cloudflare Workers (Vercel paused till 20 Dec) — adapter set up, tested on Cloudflare runtime
- [x] Supabase connection code + RSVP/open-tracking database functions (tested on local Postgres)
- [ ] Create Supabase project and run the 3 SQL files — **you** (docs/DEPLOY.md step 1)
- [ ] Connect GitHub repo in Cloudflare and add keys — **you** (docs/DEPLOY.md step 2)
- [ ] Test the live link on real phones
- [ ] Rate limits on invite opens

## ⏳ Waiting on you

- [ ] **Supabase**: create project, run SQL (docs/DEPLOY.md step 1)
- [ ] **Cloudflare**: import the GitHub repo, add keys (docs/DEPLOY.md step 2)
- [ ] Confirm dates, times and venue names for every ceremony (only Bibah, 28 Feb, is confirmed)
- [ ] Pandit ji's puja samagri list per ceremony (for checklists)
- [ ] Choose domain name (e.g. nirajandeepa.com)
- [ ] Music track for the invite (shehnai / panche baja, licensed)
- [ ] Who in the family is admin vs helper
- [ ] Real pre-wedding photos (optional)

## ⏸ Parked on purpose

- **RSVP on the invite** — hidden for now. Code is ready; turn on with `rsvpEnabled: true` in `src/config/site.ts`.
- **Music button** — hidden until a track is chosen.
- **QR photo upload / gallery (Google Drive)** — v2.

## Key dates

| When | What |
|---|---|
| ~20 Dec 2026 | Phases 2–5 built |
| Late Dec – mid Jan | Family enters real guests and details; test with 10 relatives |
| ~25 Jan 2027 | Send invitations on WhatsApp |
| 26 Feb – 1 Mar 2027 | Ceremonies (Bibah: Fagun 16 / 28 Feb) |
