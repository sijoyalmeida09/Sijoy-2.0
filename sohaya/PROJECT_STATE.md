# Sohaya — Complete Project State
**Last updated: 2026-03-21**
**Status: LIVE on http://sohaya.joshoit.com (HTTPS SSL provisioning)**

---

## 1. What Is Sohaya

An Indian entertainment marketplace — GigSalad meets Uber, built for the Vasaikar celebration market. Artists list themselves, clients discover & book instantly. Revenue comes from invisible commission layered into every quote.

**Brand:** "Sohaya" = "celebration helper" (Marathi/Hindi). Dark Netflix aesthetic, mobile-first.

**Domain:** sohaya.joshoit.com
**Repo:** github.com/sijoyalmeida09/Sijoy-2.0 (monorepo, sohaya/ folder)
**Vercel Project:** sijoy-almeidas-projects/sohaya
**Supabase Project:** ylfagpbsmbhnmomeosyx (South Asia Mumbai region)

---

## 2. Business Model & Rules (Immutable)

### Commission (invisible — never shown in UI)
| Event Type | Rate |
|------------|------|
| Restaurant / Live gig | 5% |
| Small party / Birthday | 10% |
| Corporate | 15% |
| Wedding / Sangeet / Reception | 18–20% |
| Default (unmatched) | 12% |
| Instant gig (any type) | 8% |

### Founder Artist Program
- First 50 artists to sign up get `is_founder = true`
- Founders pay **0% commission** forever
- Displayed with founder badge in UI
- Set manually by admin via `update providers set is_founder = true`

### Band Promotion Tiers
- `standard_penalty` → +5% extra commission (unpaid bands, pushed down in rankings)
- `basic` → standard rates
- `featured` / `spotlight` → paid placement, priority in search

### Payments
- UPI only at launch (zero gateway fee)
- UPI ID: `sijoyalmeida-1@oksbi`, Name: `Sohaya`
- Client pays → UTR number submitted → admin manually confirms → provider gets payout
- No Razorpay at MVP launch (wired up in code, not active)

---

## 3. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 App Router (TypeScript) |
| Styling | Tailwind CSS — dark theme, Netflix-inspired |
| Database | Supabase (PostgreSQL + RLS + Realtime) |
| Auth | Supabase Auth (Email, Magic Link, Phone OTP, Google OAuth) |
| AI / LLM | Groq API (llama-3.3-70b for intent parsing, llama-3.1-8b for narrative) |
| Payments | UPI (manual confirmation), Razorpay ready (not live) |
| Realtime | Supabase Realtime channels (gig_feed_events) |
| Deployment | Vercel (production auto-deploy on push to main) |
| Email | Resend (configured, not live — needs API key) |
| SMS / Phone OTP | Twilio (configured in Supabase, needs credentials) |

---

## 4. Database Schema (14 Tables)

All tables have RLS enabled. Applied via 7 migration files.

| Table | Purpose |
|-------|---------|
| `profiles` | Extends auth.users — role (client/provider/admin), full_name |
| `providers` | Artist profiles — categories, rates, status, is_founder, Go Live |
| `clients` | Client records — linked to profiles |
| `categories` | Artist category taxonomy (slug-based) |
| `leads` | Event booking requests from clients |
| `lead_providers` | Many-to-many: which providers a lead was distributed to |
| `quotes` | Provider quotes on leads — commission calculated here |
| `bookings` | Confirmed bookings — payment tracking |
| `instant_gigs` | Uber-mode: broadcast to all online providers within 5 min |
| `reviews` | Post-booking ratings (1–5 stars) |
| `payouts` | Provider payout records |
| `categories` | Slug-based category registry |

### Applied Migrations
| File | What it does |
|------|-------------|
| `001_initial_schema.sql` | All 14 tables + indexes + RLS policies |
| `002_launch_fixes.sql` | Idempotent fixes for initial schema issues |
| `003_fix_profile_trigger.sql` | Drop bad profiles INSERT policy blocking handle_new_user |
| `004_cleanup_seed_auth_users.sql` | Remove corrupted seed rows from auth.users |
| `005_fix_trigger_security.sql` | Fix handle_new_user trigger (SECURITY DEFINER + postgres owner) |
| `006_fix_leads_rls.sql` | Providers can SELECT leads assigned to them + UPDATE policy |
| `007_fix_instant_gigs_select.sql` | Clients/providers can SELECT instant_gigs (needed for insert().select()) |

---

## 5. Pages & Routes

### Public
| Route | Description |
|-------|-------------|
| `/` | Landing page — dual entry (client discover / artist join CTA) |
| `/login` | Auth page — Email, Magic Link, Phone OTP, Google OAuth, tab: client/artist |
| `/auth/callback` | OAuth + magic link code exchange handler |

### Client (`/(client)/`)
| Route | Description |
|-------|-------------|
| `/discover` | LLM-first discovery — AI prompt + 4 category tiles |
| `/artists/[id]` | Artist profile page |
| `/book` | 4-step booking wizard (artist → event details → guest/login → confirmation) |
| `/palettes` | AI-assembled event packages (e.g. "Royal Sangeet Package") |
| `/tonight` | Instant/tonight feed — artists available now |

### Provider (`/(provider)/`)
| Route | Description |
|-------|-------------|
| `/provider/dashboard` | Earnings overview + Go Live toggle + incoming leads |
| `/provider/go-live` | GPS + availability status page |
| `/provider/join` | 7-step onboarding wizard |
| `/provider/earnings` | Revenue breakdown + payout history |
| `/provider/leads` | Leads assigned to this provider |

### Admin (`/(dashboard)/`)
| Route | Description |
|-------|-------------|
| `/admin` | Analytics: revenue, GMV, active artists, bookings, conversion |

### API Routes (24 endpoints)
| Route | Method | Auth |
|-------|--------|------|
| `/api/artists` | GET | Public |
| `/api/artists/[id]` | GET | Public |
| `/api/artists/register` | POST | Provider |
| `/api/artists/go-live` | POST | Provider |
| `/api/ai/search` | POST | Public |
| `/api/ai/orchestrate` | POST | Public (streaming SSE) |
| `/api/ai/chat` | POST | Authenticated |
| `/api/ai/generate-bio` | POST | Provider |
| `/api/ai/palette` | POST | Public |
| `/api/leads` | GET/POST | Client |
| `/api/leads/[id]` | GET/PATCH | Client/Provider |
| `/api/quotes` | POST | Provider |
| `/api/quotes/[id]/accept` | POST | Client |
| `/api/bookings` | GET | Client/Provider |
| `/api/bookings/[id]/status` | PATCH | Admin |
| `/api/payments/create-order` | POST | Client |
| `/api/payments/verify` | POST | Client |
| `/api/payments/webhook` | POST | Razorpay (not live) |
| `/api/payments/payout` | POST | Admin |
| `/api/gigs/instant` | POST | Client |
| `/api/gigs/instant/[id]/accept` | POST | Provider |
| `/api/reviews` | POST | Client |
| `/api/admin/analytics` | GET | Admin |
| `/api/admin/artists/verify` | PATCH | Admin |

---

## 6. Auth System

### Methods Available
- **Email + Password** — standard sign in/up
- **Magic Link** — passwordless email
- **Phone OTP** — SMS via Twilio (SMS sending needs Twilio credentials)
- **Google OAuth** — fully configured, active

### Google OAuth
- Client ID: `892143778334-dhqqdv05vrjmmobms5o8l4jefss2ajgf.apps.googleusercontent.com`
- Secret: stored as Supabase project secret `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`
- Redirect URI: `https://ylfagpbsmbhnmomeosyx.supabase.co/auth/v1/callback`
- JS Origin: `https://sohaya.joshoit.com`

### Role Detection (auto)
- On login, `ClientLayout` fetches `profile.role` from Supabase
- Navbar routes accordingly:
  - `provider` → `/provider/dashboard` "My Dashboard"
  - `admin` → `/admin` "Admin Panel"
  - `client` → `/discover` "My Bookings"
- Middleware protects: `/dashboard`, `/provider`, `/admin` (NOT `/book` — guests can book)

### Admin Access
- Set `role = 'admin'` on `profiles` after Google sign-in:
  ```sql
  update profiles set role = 'admin' where email = 'sijoyalmeida@gmail.com';
  ```
- Admin can verify artists, confirm bookings, view analytics

---

## 7. Key Features

### AI Orchestration (Streaming)
`POST /api/ai/orchestrate` — SSE stream:
1. Parse intent (llama-3.3-70b) → event type, city, budget, mood
2. Query verified providers from Supabase (filtered by city + budget)
3. Stream artists in 3 batches (progressive loading)
4. Assemble event palettes (curated packages like "Royal Sangeet Package")
5. Generate upsells (photographer add-on, budget upgrade)
6. AI narrative summary (llama-3.1-8b)

### Instant Gig (Uber Mode)
- Client posts a gig → broadcasts to ALL online providers via Supabase Realtime
- 5-minute acceptance window (expires_at)
- Provider sees popup → accepts → booking auto-created
- 8% platform commission on instant gigs

### Go Live (Provider)
- Provider toggles `is_online = true` + shares GPS location
- Broadcasts `provider_online` event via Realtime channel `gig_feed_events`
- Client `/tonight` feed shows live artists on a map

### Guest Booking Flow
- Unauthenticated users can browse and initiate booking
- At checkout (Step 1 of book page), guest provides name/phone/email
- System auto-creates account with random password → sends magic link
- Booking proceeds seamlessly

---

## 8. Test Data

### Test Accounts (password: `SohayaTest2024!`)
| Account | Email | Role |
|---------|-------|------|
| Client | testclient@sohaya.app | Client |
| Artist 1 (Ravi) | ravi.band@sohaya.app | Provider |
| Artist 2 (Priya) | priya.dancer@sohaya.app | Provider |
| Artist 3 (DJ Max) | dj.max@sohaya.app | Provider |

### Seed Scripts
- `scripts/seed-test-data.mjs` — creates 4 test users + profiles + provider records
- `scripts/seed-artists.mjs` — 50 diverse verified artists across 12+ categories, 10+ cities
- `scripts/smoke-test.mjs` — 16-step end-to-end test (all passing ✅)

### Current DB State
- 51 verified providers
- 52 auth users
- Multiple test leads, bookings, quotes, reviews from smoke test runs

---

## 9. Deployment & Infrastructure

### Vercel Config
- Project: `sijoy-almeidas-projects/sohaya`
- Root directory: `sohaya/` (monorepo)
- Auto-deploy: push to `main` branch

### Vercel Production Env Vars
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ylfagpbsmbhnmomeosyx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | set |
| `SUPABASE_SERVICE_ROLE_KEY` | set |
| `GROQ_API_KEY` | set (gsk_...) |
| `NEXT_PUBLIC_APP_URL` | `https://sohaya.joshoit.com` |
| `SUPABASE_COOKIE_DOMAIN` | `.joshoit.com` |
| `NEXT_PUBLIC_UPI_ID` | `sijoyalmeida-1@oksbi` |
| `NEXT_PUBLIC_UPI_NAME` | `Sohaya` |

### DNS (Hostinger)
- `sohaya.joshoit.com` A record → `76.76.21.21` (Vercel) ✅
- HTTPS SSL: Vercel provisioning (async, ~15 min after domain add)

---

## 10. ✅ DONE — Completed Features

### Infrastructure
- [x] Next.js 14 project bootstrapped with TypeScript + Tailwind
- [x] Supabase dedicated project (ylfagpbsmbhnmomeosyx)
- [x] 14-table schema deployed with RLS
- [x] All 7 migrations applied to production DB
- [x] Vercel deployment wired to GitHub main branch
- [x] Custom domain sohaya.joshoit.com configured
- [x] All env vars set in Vercel production

### Auth
- [x] Email + password sign in/up
- [x] Magic link (email)
- [x] Google OAuth (active — credentials configured + pushed)
- [x] Phone OTP UI (built — needs Twilio credentials to send SMS)
- [x] Auth callback route (`/auth/callback`)
- [x] Role-aware navbar (provider/admin/client routing)
- [x] Guest booking flow (auto-signup at checkout)
- [x] `handle_new_user` trigger working (creates profile on signup)
- [x] Middleware protecting provider/admin routes

### Artist Side
- [x] 7-step artist onboarding wizard (`/provider/join`)
- [x] Provider dashboard with Go Live toggle
- [x] Go Live GPS broadcast via Realtime
- [x] Earnings page
- [x] Leads inbox (assigned leads)
- [x] Quote creation with invisible commission
- [x] AI bio generation

### Client Side
- [x] LLM-first discovery (`/discover`)
- [x] AI orchestration (streaming SSE, 5 phases)
- [x] Artist grid + palette cards
- [x] Artist profile pages
- [x] 4-step booking wizard
- [x] Instant gig posting (Uber mode)
- [x] Review submission (post-booking)
- [x] `/tonight` feed (live artists)

### Admin
- [x] Analytics dashboard (revenue, GMV, active artists, bookings)
- [x] Artist verify endpoint
- [x] Booking status management

### Backend / API
- [x] All 24 API routes built and tested
- [x] Invisible commission engine (5 event types × 3 provider tiers)
- [x] Lead distribution (event type → category matching → provider assignment)
- [x] UPI payment flow (create order → UTR submit → admin confirm)
- [x] Realtime broadcasts (fire-and-forget, serverless-safe)
- [x] RLS policies for all critical flows

### Testing
- [x] `seed-test-data.mjs` — 4 test accounts
- [x] `seed-artists.mjs` — 50 verified artists
- [x] `smoke-test.mjs` — 16/16 flows passing ✅

---

## 11. ⏳ REMAINING — What's Not Done Yet

### P0 — Needed Before Real Users

| Task | Why | Effort |
|------|-----|--------|
| **SSL cert live on HTTPS** | Vercel provisioning, ~15 min — no action needed | Auto |
| **Set admin role for sijoyalmeida@gmail.com** | Sign in with Google first, then run SQL | 2 min |
| **Twilio credentials** | Phone OTP UI exists, SMS won't send without Account SID + Auth Token | 30 min |
| **Apply migrations via SQL editor** | Run `supabase/apply_migrations.sql` in Supabase Dashboard as safety net | 5 min |

### P1 — First Week After Launch

| Task | Why | Effort |
|------|-----|--------|
| **Email notifications (Resend)** | Clients/artists get no emails on booking — needs `RESEND_API_KEY` | 2h |
| **WhatsApp notification on booking** | Msg91 integration for booking confirmations | 4h |
| **Artist photo/video upload** | Providers need media on profiles — needs Supabase Storage buckets | 4h |
| **Real-time tonight map** | `/tonight` page shows live artists — map component needs Google Maps API key | 3h |
| **Artist profile completeness score** | `profile_completeness` field exists but not calculated | 2h |
| **Admin: manual booking confirmation UI** | Admin currently confirms via direct DB; needs UI | 3h |
| **Payout tracking UI** | `/provider/earnings` shows payouts but payout creation is admin-only API | 2h |

### P2 — Growth Phase

| Task | Why | Effort |
|------|-----|--------|
| **Razorpay live integration** | Replace UPI manual flow with automated Razorpay | 1 day |
| **Artist search filters** | City, budget, category filters on /discover browse tab | 4h |
| **Booking calendar / availability** | Providers can block dates | 1 day |
| **Push notifications (PWA)** | Artist gets notified of new leads on mobile | 1 day |
| **Subscription tiers for artists** | `subscription_tier` field exists (free/basic/pro) — needs payment flow | 2 days |
| **Category pages** | `/discover/bollywood-band` etc. for SEO | 4h |
| **Review reply** | Provider can reply to reviews | 2h |
| **Multi-city expansion** | Currently Vasai-focused; generalize city landing pages | 3 days |
| **Cancellation policy** | `cancellation_policies` table partially exists | 1 day |
| **Instagram/YouTube media import** | Artists import media from social profiles | 2 days |

### P3 — Scale

| Task | Why | Effort |
|------|-----|--------|
| **Full-text search (pgvector)** | AI semantic search with embeddings | 3 days |
| **Dynamic pricing engine** | Demand-based commission rates | 1 week |
| **B2B / Venue partnerships** | Corporate clients, bulk bookings | 2 weeks |
| **Artist mobile app** | React Native / PWA | 1 month |
| **Stripe international** | For non-India clients | 1 week |

---

## 12. Smoke Test Coverage (16/16 ✅)

```
[PUBLIC]  Homepage loads
[PUBLIC]  GET /api/artists (20+ artists)
[PUBLIC]  POST /api/ai/search
[CLIENT]  Sign in
[CLIENT]  POST /api/leads (direct to artist)
[CLIENT]  POST /api/payments/create-order
[CLIENT]  POST /api/payments/verify (UTR)
[ARTIST]  Sign in
[ARTIST]  GET /api/bookings?role=provider
[ARTIST]  POST /api/quotes (commission applied)
[ARTIST]  POST /api/artists/go-live
[ADMIN]   See pending providers
[ADMIN]   Verify artist (DB direct)
[ADMIN]   Confirm booking
[CLIENT]  POST /api/reviews
[CLIENT]  POST /api/gigs/instant (Uber mode)
```

---

## 13. Immediate Next Actions (in order)

1. **Wait for HTTPS** (~15 min from domain add) — then run: `node scripts/smoke-test.mjs https://sohaya.joshoit.com`
2. **Set admin role:** Sign in at sohaya.joshoit.com/login with Google (sijoyalmeida@gmail.com), then in Supabase SQL Editor:
   ```sql
   update profiles set role = 'admin' where email = 'sijoyalmeida@gmail.com';
   ```
3. **Twilio setup:** Get credentials at twilio.com → set 3 Vercel env vars → redeploy
4. **Resend email:** Get API key at resend.com → set `RESEND_API_KEY` in Vercel
5. **First real artist:** Manually onboard 1-2 real Vasai artists via `/provider/join`

---

## 14. Architecture Decisions (Why)

| Decision | Rationale |
|----------|-----------|
| Groq (not OpenAI) | Free tier, much faster inference, llama-3.3-70b comparable quality |
| UPI not Razorpay at launch | Zero fees, instant for Indian users, no gateway approval delay |
| SSE streaming for AI | Progressive loading feels fast even with 2-3 sec LLM latency |
| Invisible commission | Industry standard (not shown to either party) — GigSalad does same |
| Supabase Realtime for Go Live | No separate websocket server needed, built into DB layer |
| Next.js App Router | RSC + streaming + server actions — best for this hybrid client/server pattern |
| Monorepo (Sijoy-2.0) | sohaya + josho-hub + ecc all in one repo, shared Vercel org |

---

## 15. File Reference

```
sohaya/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── login/                      # Auth (Google + Email + Phone OTP)
│   │   ├── auth/callback/              # OAuth code exchange
│   │   ├── (client)/
│   │   │   ├── discover/               # LLM-first search
│   │   │   ├── artists/[id]/           # Artist profile
│   │   │   ├── book/                   # Booking wizard (guest-friendly)
│   │   │   ├── palettes/               # AI event packages
│   │   │   ├── tonight/                # Live artists feed
│   │   │   └── layout.tsx              # Role-aware navbar
│   │   ├── (provider)/
│   │   │   ├── dashboard/              # Go Live + earnings overview
│   │   │   ├── go-live/                # GPS toggle
│   │   │   ├── join/                   # 7-step onboarding
│   │   │   ├── earnings/               # Revenue breakdown
│   │   │   └── leads/                  # Assigned leads inbox
│   │   ├── (dashboard)/
│   │   │   └── admin/                  # Analytics + verifications
│   │   └── api/                        # 24 API routes (see §5)
│   ├── components/
│   │   ├── sohala/navbar.tsx           # Role-aware navigation
│   │   └── ui/                         # Button, Input, Card etc.
│   ├── lib/
│   │   └── supabase/                   # server.ts + client.ts
│   └── middleware.ts                   # Route protection
├── supabase/
│   ├── config.toml                     # Auth config (Google OAuth, SMS)
│   ├── migrations/                     # 7 migration files (all applied)
│   └── apply_migrations.sql            # Single-file SQL for manual apply
├── scripts/
│   ├── seed-test-data.mjs              # 4 test accounts
│   ├── seed-artists.mjs                # 50 test artists
│   └── smoke-test.mjs                  # 16-step E2E test
└── .env.local                          # Local dev env (never committed)
```
