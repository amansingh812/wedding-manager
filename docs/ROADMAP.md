# Roadmap — Wedding Manager

Single source of truth for **what's done, what's in progress, and what's next**.
Update the status column at the end of every work session, and add a line to `docs/PROGRESS.md`.

Status: ✅ done · 🟡 in progress · ⬜ not started · ⏸ later (v2)

Reference docs:
- Product Requirements (v1 Final): https://claude.ai/artifact/M6rMrSuEuFmHDEZqeAVPkA
- System Design & Database: https://claude.ai/artifact/FJ8ZZJgwfyCZ4BWjCX9CgL
- Approved designs (canvas): https://claude.ai/artifact/RKN8872exjPiWVnbygMDuR

## Phase 0 — Project setup
| # | Stage | Status |
|---|---|---|
| 0.1 | Next.js 15 + TypeScript + Tailwind scaffold, self-hosted fonts | ✅ |
| 0.2 | Supabase schema migration (10 tables, 3 views, RLS), verified on local Postgres | ✅ |
| 0.3 | Seed data for local testing (wedding, 6 ceremonies, 3 demo households) | ✅ |
| 0.4 | Data layer: mock store now, Supabase store in Phase 2 | ✅ |
| 0.5 | CI: lint, typecheck, unit tests, build on every push | ✅ |
| 0.6 | GitHub repo `amansingh812/wedding-manager` (private) | ✅ |

## Phase 1 — Guest invitation (runs on mock data)
| # | Stage | Status |
|---|---|---|
| 1.1 | `/invite/[slug]` route, invalid-link page | ✅ |
| 1.2 | Sealed doors → doors-open video → welcome card | ✅ |
| 1.2a | Doors open onto Lord Ganesh; he stays in the background while the invitation card rises over him | ✅ |
| 1.2b | Closing blessing (Mithila Ganesh + Vakratunda shloka) at the end of the ceremonies page; Ganesh on the home page | ✅ |
| 1.3 | Your ceremonies: only invited, BS/AD, maps, dress colours | ✅ |
| 1.4 | RSVP per ceremony + headcount + veg count + blessing (built; hidden via `site.rsvpEnabled = false`) | ⏸ |
| 1.5 | Thank-you screen, edit RSVP, deadline lock | ✅ |
| 1.6 | Add-to-calendar `.ics`, WhatsApp link preview (OG) | ✅ |
| 1.7 | Opening plays every visit; returning guests get "Skip to my ceremonies"; replay button; reduced-motion support | ✅ |
| 1.8 | Manual test on phone viewport + code review | ✅ |

## Phase 2 — Supabase connected
| # | Stage | Status |
|---|---|---|
| 2.1 | Create Supabase project (user), run migrations + seed | ✅ |
| 2.2 | Supabase store behind the same data layer | ✅ |
| 2.3 | Opened tracking + RSVP writes (DB functions `mark_invite_opened`, `save_rsvp`) | ✅ |
| 2.4 | Rate limits (Cloudflare binding) wired in; manual test 25 Nov: binding never blocked (approximate per-location counting). Magic-link emails are limited by Supabase Auth itself. Revisit with a Postgres limiter in 6.1 | 🟡 |
| 2.5 | Deploy to Cloudflare Workers via OpenNext (Vercel paused) — config done, user connects repo | ✅ |

## Phase 3 — Family admin: guests & ceremonies
| # | Stage | Status |
|---|---|---|
| 3.1 | Magic-link login, members & roles (invite-only family list) | ✅ |
| 3.2 | Ceremony editor (draft / published, "missing venue/time/map" hints; family read-only) | ✅ |
| 3.3 | Household list (search, side filter, status), add/edit with per-household ceremony ticks, paste from Excel with preview | ✅ |
| 3.4 | Ceremony grid (tick boxes, instant save, per-ceremony counts) + side shortcuts | ✅ |
| 3.5 | WhatsApp Send / Resend (wa.me with message ready), Copy message when no phone, editable message with {name}/{link}, sent/opened status | ✅ |

## Phase 4 — Dashboard, checklists, ledger
| # | Stage | Status |
|---|---|---|
| 4.1 | Dashboard: countdown hero, family count (by side, people), invitations sent/opened, next ceremony, image shortcuts. Per-ceremony headcount dropped (user) | ✅ |
| 4.2 | Ceremony checklists: starter lists per ceremony (in code), add/assign/due, tick done, My items / Overdue, progress chips | ✅ |
| 4.3 | Expense ledger: total / paid / still to pay (रु, Nepali grouping), by ceremony; admin edits, family views | ✅ |
| 4.4 | CSV downloads: guest list (with ceremonies + invite links), checklists, expenses. Plate counts dropped with headcount | ✅ |

## Phase 5 — Public home page
| # | Stage | Status |
|---|---|---|
| 5.1 | Public home: Shree Ganesh hero + live countdown, welcome, two traditions (Maithil/Pahadi), celebrations (names, dates, time, city — no addresses/maps), Mithila blessing, footer. Text in `weddings.home` (migration 0006) | ✅ |

## Phase 6 — Launch hardening
| # | Stage | Status |
|---|---|---|
| 6.1 | RLS tests, security review | ⬜ |
| 6.2 | Performance pass (3G test, < 500 KB first screen) | ⬜ |
| 6.3 | Backups + CSV fallback, domain, production deploy | ⬜ |
| 6.4 | Family test with 10 relatives, then send invites (~25 Jan) | ⬜ |

## Later (v2)
| Stage | Status |
|---|---|
| QR photo upload at venues → Google Drive (OAuth, drive.file) | ⏸ |
| Photo gallery on the site | ⏸ |
| Automatic WhatsApp reminders | ⏸ |
