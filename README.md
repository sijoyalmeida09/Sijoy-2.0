# Sijoy Almeida — JoSho Empire

[![Deploy Site](https://github.com/sijoyalmeida09/Sijoy-2.0/actions/workflows/deploy.yml/badge.svg)](https://github.com/sijoyalmeida09/Sijoy-2.0/actions/workflows/deploy.yml)

Engineer. Founder. Builder.

A monorepo housing the full JoSho Empire: static portfolio sites, a Next.js central hub, and backend automation.

**Live:** [joshoit.com](https://joshoit.com) · [sijoy.joshoit.com](https://sijoy.joshoit.com) · [GitHub Pages](https://sijoyalmeida09.github.io/Sijoy-2.0)

---

## Repo Structure

| Path | Purpose | Deployed |
|------|---------|---------|
| `index.html` | JoSho IT business homepage | Hostinger → joshoit.com |
| `sijoy.html` | Personal portfolio (7 interactive chapters) | Hostinger → sijoy.joshoit.com |
| `resume.html` | Token-gated persona resume (Fan / Recruiter / Client) | Hostinger + GitHub Pages |
| `resume-data/` | Resume persona JSON | Deployed with static site |
| `assets/` | Images, logos, PDFs | Deployed with static site |
| `josho-hub/` | Next.js 14 Central Hub — music, dashboard, future products | Vercel (separate deploy) |
| `josho-ops/` | Node.js overnight automation pipeline | Local / Windows Task Scheduler |

---

## Static Sites (`index.html`, `sijoy.html`, `resume.html`)

Pure HTML/JS — no build step. Deployed automatically on push via GitHub Actions to Hostinger and GitHub Pages.

**Tech:**
- Three.js — hero particle system + neural network visualization
- GSAP 3.12 — ScrollTrigger, pinned sections, horizontal scroll, counters
- Lenis — smooth scroll
- Vanilla JS — zero frameworks

**sijoy.joshoit.com chapters:**
1. Hero — Three.js particle field, mouse-reactive
2. Origin — scroll-scrubbed SVG timeline (Vasai → Now)
3. Arsenal — interactive skills constellation
4. Builds — horizontal scroll through 7 projects with metrics
5. Signal — live stat counters (YouTube, GitHub)
6. Vision — what's next
7. Connect — contact, social links, resume download

---

## JoSho Hub (`josho-hub/`)

Single Next.js app serving all dynamic products under joshoit.com.

**Stack:** Next.js 14 App Router · Supabase Auth + Postgres · Resend · Tailwind CSS · TypeScript

**Current products:**
- **Vasaikar Live** (`music.joshoit.com`) — artist discovery, event bookings, musician dashboard
- **Role-based dashboard** — `admin` / `musician` / `client` views, JoSho Points engine
- **Future:** jamin.joshoit.com and others via new route groups — no new repos needed

```bash
cd josho-hub
cp .env.example .env.local   # fill Supabase + Resend keys
npm install
npm run dev
```

See [`josho-hub/README.md`](josho-hub/README.md) for full env and Supabase setup.

---

## JoSho Ops (`josho-ops/`)

Node.js automation pipeline that runs overnight (2 AM via Windows Task Scheduler).

**Pipeline phases:** Gather → Create → Build → Process → Package → Notify

Includes 13 SOPs, 35 email templates, and an agent-based orchestrator.
Not deployed as a server — local only. See [`josho-ops/README.md`](josho-ops/README.md).

---

## Deploy

| Target | Source | Method |
|--------|--------|--------|
| joshoit.com | `index.html`, `resume.html`, `resume-data/`, `assets/` | GitHub Actions → Hostinger SSH |
| sijoy.joshoit.com | `sijoy.html` | Same workflow |
| GitHub Pages | Full repo artifact | Same workflow |
| music.joshoit.com | `josho-hub/` | Vercel (separate project) |

Workflow triggers on push to `main` (matching paths) and supports manual `workflow_dispatch`.

---

## Expansion Rules

- New hub feature (music, jamin, dashboard) → **`josho-hub/`** only
- New subdomain → new route group inside `josho-hub/`, not a new repo folder
- New booking table/API → use `event_bookings` / `artist_profiles` (not legacy `bookings`)
- New automation/SOP → **`josho-ops/`**
- Static content (portfolio, resume) → repo root only

See [`REPO_STRUCTURE.md`](REPO_STRUCTURE.md) for full architecture and checklist.
