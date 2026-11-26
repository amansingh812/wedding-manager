# Project status — Wedding Manager

_Last updated: 26 Nov 2026 · Phases 0–5 done, live at https://wedding-manager.amanpd0.workers.dev_

One page to see what's done, what's pending and what's waiting on someone.

## Phases

| # | Phase | Status |
|---|---|---|
| 0 | Project setup (Next.js, DB schema, CI, GitHub repo) | ✅ Done |
| 1 | Guest invitation (doors → Ganesh → card → ceremonies → blessing) | ✅ Done (RSVP hidden on purpose) |
| 2 | Supabase + Cloudflare Workers, live site | ✅ Done (rate limits: see below) |
| 3 | Family admin: login, ceremonies, guests, Excel paste, invite grid, WhatsApp send | ✅ Done |
| 4 | Dashboard (family count), checklists, expenses, CSV downloads | ✅ Done |
| 5 | Public home page | ✅ Done |
| 6 | Launch hardening, domain, family test, send invites | ⬜ Next |

## ⬜ Still to build

- **Phase 5 — public home page:** hero with Shree Ganesh, countdown, the couple, two cultures (Mithila + Pahadi), ceremonies, venues & maps, footer. Uses existing Higgsfield images.
- **Phase 6 — launch hardening:**
  - Database-backed rate limit for login/RSVP (Cloudflare's limiter didn't block in testing)
  - Security pass on database rules (automated tests)
  - Speed check on a slow phone connection
  - Remove demo households + turn off demo links on the home page (`SHOW_DEMO_LINKS`)
  - Backups (weekly CSV + Supabase backup), custom domain
  - Family test with ~10 relatives, then send invites (~25 Jan)

## ⏳ Waiting on you

- [ ] Real venue names, times and Google Maps links for each ceremony (Admin → Ceremonies; Bibah/Reception still show "[Venue]")
- [ ] Real guest list (Admin → Guests → Paste from Excel)
- [ ] Add family helpers who should sign in (Admin → Family)
- [ ] Pandit ji's samagri list, to adjust the starter checklists
- [ ] Domain name (e.g. nirajandeepa.com) — optional
- [ ] Music track for the invite (licensed) — optional
- [ ] "ASHIRAN" nickname — where to show it
- [ ] Delete `Documents/GitHub/_to_delete/` on the Mac and `git pull`

## ⏸ Parked on purpose

- **RSVP on the invite** — code ready; `rsvpEnabled: true` in `src/config/site.ts`
- **Per-ceremony headcount** — dropped; dashboard shows family count only
- **Music button**, **QR photo upload → Google Drive**, **photo gallery**, **automatic reminders** — v2

## Key dates

| When | What |
|---|---|
| Early Dec 2026 | Phase 5 home page |
| Mid Dec 2026 | Phase 6 hardening |
| Late Dec – mid Jan | Family enters real guests & details; test with 10 relatives |
| ~25 Jan 2027 | Send invitations on WhatsApp |
| 26 Feb – 1 Mar 2027 | Ceremonies (Bibah: Fagun 16 / 28 Feb) |
