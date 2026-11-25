# Project Status — Wedding Manager

_Last updated: 25 Nov 2026_

One page to see what's done, what's pending and what's waiting on someone.
Details per stage: [`docs/ROADMAP.md`](docs/ROADMAP.md) · session notes: [`docs/PROGRESS.md`](docs/PROGRESS.md)

## Overall

| Phase | What | Status |
|---|---|---|
| 0 | Project setup (code, database design, tests, GitHub) | ✅ Done |
| 1 | Guest invitation (doors → Ganesh → invitation card → ceremonies) | ✅ Done (RSVP hidden for now) |
| 2 | Connect Supabase + first online preview on Vercel | ⬜ Not started — **waiting on you** |
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

- [ ] Create Supabase project and load the database
- [ ] Switch the app from demo data to Supabase
- [ ] Deploy a preview on Vercel and test on real phones

## ⏳ Waiting on you

- [ ] **Sign up / sign in to Supabase** (free) — needed to start Phase 2
- [ ] **Sign in to Vercel** with GitHub — needed for the preview link
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
