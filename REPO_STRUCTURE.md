# Sijoy 2.0 — Repository structure and expansion scope

Single repo for static sites, central hub app, ops automation, and plans. This doc keeps everything aligned and avoids duplication.

---

## Top-level layout

| Path | Purpose | Deployed / used |
|------|---------|-----------------|
| **`index.html`** | JoSho IT business homepage (joshoit.com) | Hostinger `public_html` |
| **`sijoy.html`** | Personal portfolio (sijoy.joshoit.com) | Hostinger `public_html/sijoy` |
| **`resume.html`** | Persona-based resume (token auth, Fan/Recruiter/Client) | Hostinger + GitHub Pages |
| **`resume-data/`** | JSON for resume personas | Deployed with static site |
| **`assets/`** | Images, logos, PDFs | Deployed with static site |
| **`.github/workflows/deploy.yml`** | Deploys static site to Hostinger + GitHub Pages | On push to main (paths: index, sijoy, resume, resume-data, assets) |
| **`josho-hub/`** | **Single Next.js app**: Central Hub + Music (Vasaikar Live) + future jamin/real estate | Deploy separately (e.g. Vercel); not in current workflow |
| **`josho-ops/`** | Backend automation: agents, email, SOPs, data dirs | Local (Task Scheduler 2am); optionally versioned |
| **`.cursor/plans/`** | Stored plans (reliability, India AI, etc.) | Reference only |

### Ignored / legacy (in root `.gitignore`)

- **`hub/`** — Legacy or duplicate; **do not use**. All hub functionality lives in **`josho-hub/`**.
- **`josho-portal/`** — Old or alternate portal; not the main app. Use **`josho-hub/`** for any portal.
- **`josho-quote/`** — Separate quote tool; no overlap with hub.
- **`cross-page-posting/`** — Separate; no overlap.
- **`node_modules/`**, **`.env`** — Standard ignores.

**Rule:** One central app = **`josho-hub/`**. Music (music.joshoit.com), future jamin (jamin.joshoit.com), and generic dashboard all live in this one codebase. No second “hub” or “portal” app in this repo.

---

## josho-hub: one app, many products

- **Auth & data:** Supabase (shared). Migrations: `0001_unified_identity_core.sql`, `0002_vasaikar_live.sql`, `0003_schedule_requests_event_bookings.sql`.
- **Booking model:** Use **`event_bookings`** and **`artist_profiles`** only. The old `bookings` table (in 0001) is legacy; new code must not depend on it. Schedule change requests reference **`event_bookings`** (see 0003).
- **Route groups:**
  - **`(music)`** — Public: `/discover`, `/artists/[id]`, `/book`, `/join`. Layout: Vasaikar Live nav.
  - **`(dashboard)`** — Auth required: `/dashboard`, `/my-gigs`, `/my-bookings`, `/my-earnings`. Layout: sidebar + loyalty card.
- **Future expansion (e.g. jamin.joshoit.com):** Add route group **`(jamin)`** and pages under it; same Supabase project and auth. No new repo.

---

## josho-ops: backend automation

- **Role:** Overnight pipeline (orchestrator → analyst, content-creator, email-automator, etc.), email sequences, SOPs.
- **Not deployed as a server:** Runs on your machine via `overnight-agents.bat` / Task Scheduler.
- **Overlap with hub:** None. Hub is the front-end and API; josho-ops is internal automation. They can share concepts (e.g. “invoice” in SOP 07 and future hub CRM) but no duplicated code.
- **Versioning:** If **`josho-ops/`** is in `.gitignore`, it is not in the repo; un-ignore to version SOPs and scripts. Keep secrets in `.env` only.

---

## Plans vs implemented

| Plan / doc | Location | Status |
|------------|----------|--------|
| **Reliability & India AI compute** | `.cursor/plans/reliability_and_india_ai_compute_64ccaa0b.plan.md` | Not implemented. Improves static site + josho-ops (CDN, monitoring, India AI for agents). Independent of josho-hub. |
| **Vasaikar Live business plan** | `josho-hub/docs/vasaikar-live-business-plan.md` | Implemented in josho-hub (discover, book, join, my-gigs, my-bookings, event_bookings, artist_profiles). |
| **CRM / musician portal (roles)** | Discussed in chat; no plan file in repo | Implemented in josho-hub (role-based dashboard, musician vs organizer flows). |

---

## Deploy summary

| Target | Source | How |
|--------|--------|-----|
| joshoit.com (business) | `index.html`, `resume.html`, `resume-data/`, `assets/` | GitHub Actions → Hostinger |
| sijoy.joshoit.com | `sijoy.html` (copied as index in sijoy/) | Same workflow |
| GitHub Pages | Full repo artifact | Same workflow |
| music.joshoit.com (and future jamin) | **`josho-hub/`** only | Requires Node.js host (Hostinger VPS, Railway, Render, etc.); not in current static workflow. |

---

## Checklist before adding new work

- [ ] New feature for “central hub” or “music” or “booking” → implement in **`josho-hub/`** only.
- [ ] New subdomain (e.g. jamin) → add route group and routes in **`josho-hub/`**; do not create a new app folder at repo root.
- [ ] New booking-related table or API → use **`event_bookings`** / **`artist_profiles`**; do not use legacy **`bookings`**.
- [ ] Changes to static site (index, sijoy, resume) → keep under repo root; do not duplicate in josho-hub.
- [ ] New automation or SOP → add under **`josho-ops/`**; do not duplicate in hub.
