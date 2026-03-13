# Sijoy 2.0 — Complete Project Details

## Overview

Single repository for JoSho Empire: static sites, central hub app (josho-hub), and ops automation. One codebase for business, portfolio, and music marketplace (Vasaikar Live).

---

## Repository Structure

```
Sijoy_2.0/
├── index.html              # joshoit.com — JoSho IT business homepage
├── sijoy.html              # sijoy.joshoit.com — Personal portfolio
├── resume.html             # Persona-based resume (token auth)
├── resume-data/            # JSON for resume personas
├── assets/                 # Images, logos, PDFs
├── .github/workflows/      # Deploy to Hostinger + GitHub Pages
├── josho-hub/              # Next.js app — Central Hub + Vasaikar Live
├── josho-ops/              # Backend automation (local, Task Scheduler)
├── .cursor/plans/          # Stored plans
├── DEPLOY.md               # Deployment guide
├── REPO_STRUCTURE.md       # Structure and expansion rules
└── PROJECT_DETAILS.md      # This file
```

---

## Domains & Deployment

| Domain | URL | Source | Status |
|--------|-----|--------|--------|
| **joshoit.com** | https://joshoit.com | index.html | Live (Hostinger) |
| **sijoy.joshoit.com** | https://sijoy.joshoit.com | sijoy.html | Live (Hostinger) |
| **GitHub Pages** | https://sijoyalmeida09.github.io/Sijoy-2.0/ | Full repo | Live |
| **music.joshoit.com** | — | josho-hub | Local only (needs Node.js host) |

**Deploy trigger:** Push to `main` when `index.html`, `sijoy.html`, `resume.html`, `resume-data/**`, `assets/**` change.

**Secrets:** `HOSTINGER_HOST`, `HOSTINGER_USER`, `HOSTINGER_SSH_KEY`, `HOSTINGER_PORT`

---

## josho-hub (Next.js App)

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind CSS |
| Auth | Supabase Auth (magic link, phone OTP) |
| Database | Supabase Postgres (RLS) |
| Email | Resend |
| Payments | Razorpay |
| Validation | Zod |
| Carousel | embla-carousel-react |

### Route Structure

| Route Group | Paths | Auth | Purpose |
|-------------|-------|------|---------|
| **(music)** | `/`, `/discover`, `/artists/[id]`, `/book`, `/join`, `/studio` | Public | Vasaikar Live — artist discovery, booking, onboarding |
| **(dashboard)** | `/dashboard`, `/my-gigs`, `/my-bookings`, `/my-earnings`, `/admin/artists` | Required | Role-based dashboards |
| — | `/login`, `/auth/callback`, `/auth/logout` | — | Auth flows |

### API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/artists/register` | POST | Artist onboarding |
| `/api/artists/[id]` | GET | Artist data for modal |
| `/api/artists/suggested-price` | GET | Regional median rate by instrument |
| `/api/admin/artists/verify` | POST | Admin verify/reject artist |
| `/api/bookings/create` | POST | Create booking request |
| `/api/bookings/update-status` | POST | Status transition (state machine) |
| `/api/bookings/confirm` | POST | Webhook — booking confirmation |
| `/api/bookings/request-change` | POST | Schedule change request |
| `/api/reviews/create` | POST | Submit booking review |
| `/api/payments/create-order` | POST | Razorpay order for deposit |
| `/api/payments/verify` | POST | Verify Razorpay payment |
| `/api/payments/webhook` | POST | Razorpay webhook (payment.captured) |
| `/api/payments/payout` | POST | Admin trigger payout |
| `/api/points` | POST | Award loyalty points |

### Database (Supabase)

**Migrations:** `0001` (identity), `0002` (Vasaikar Live), `0003` (schedule requests), `0004` (Tier 1)

**Core tables:**
- `profiles` — users, roles (admin/musician/client/user), loyalty_points
- `artist_profiles` — stage_name, event_rate, verification_status, genres, instruments
- `artist_media` — images, videos, audio, YouTube
- `event_bookings` — bookings with escrow, Razorpay IDs, status machine
- `booking_reviews`, `artist_recommendations`, `schedule_change_requests`
- `genres`, `instruments` — lookup tables

### Features (Vasaikar Live)

- **Discover** — Netflix-style artist grid, genre/budget/date filters, verified-only
- **Artist modal** — Glassmorphism overlay (no full-page nav)
- **MediaCarousel** — Swipeable image/video/audio/YouTube
- **Booking wizard** — Lead artist + band builder, 10% bundle discount
- **Artist join** — 3-step onboarding, YouTube channel auto-pull, suggestive pricing, premium upsell
- **Admin** — Verify/reject artists
- **Payments** — Razorpay deposit, escrow, payout on completion
- **Auth** — Phone OTP, email magic link, role-based access

### Environment Variables (josho-hub/.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://joshoit.com
SUPABASE_COOKIE_DOMAIN=.joshoit.com
RESEND_API_KEY=
WELCOME_EMAIL_FROM=JoSho Empire <hello@joshoit.com>
BOOKING_CONFIRM_WEBHOOK_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
YOUTUBE_API_KEY=
```

### Run Locally

```bash
cd josho-hub
npm install
# Copy .env.example to .env.local, fill values
npm run dev
# Open http://localhost:3000
```

---

## josho-ops (Backend Automation)

- **Role:** Overnight pipeline, email sequences, SOPs
- **Run:** Local via `overnight-agents.bat` / Task Scheduler (2am)
- **Stack:** Node.js, Resend, file-based data
- **Folders:** `agents/`, `email/`, `sops/`, `data/`
- **Not deployed** as a server; separate from josho-hub

---

## Static Sites (Root)

| File | Purpose |
|------|---------|
| index.html | JoSho IT — services, contact, social links |
| sijoy.html | Personal portfolio — chapters, projects, resume |
| resume.html | Token-gated resume (Fan/Recruiter/Client personas) |

---

## Key Docs

| Doc | Purpose |
|-----|---------|
| REPO_STRUCTURE.md | Layout, rules, what to avoid |
| DEPLOY.md | Deployment steps, domains |
| josho-hub/docs/vasaikar-live-business-plan.md | Business plan |
| josho-ops/sops/14-vasaikar-live-operations.md | Music ops SOP |

---

## Git & GitHub

- **Repo:** sijoyalmeida09/Sijoy-2.0
- **Branch:** main
- **Workflow:** `.github/workflows/deploy.yml` — Hostinger SSH + GitHub Pages
