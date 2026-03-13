# JoSho Empire Central Hub

Unified identity and dashboard core for:
- `music.joshoit.com`
- `jamin.joshoit.com`
- `joshoit.com` services

**Start building:** From this directory run `npm install` then `npm run dev`. Copy `.env.example` to `.env.local` and add your Supabase + Resend keys (see below).

## Stack
- Next.js 14 App Router
- Supabase Auth + Postgres (RLS)
- Resend email

## 1) Configure Supabase for multi-subdomain auth

In Supabase Auth settings:
- Add site URL (production): `https://joshoit.com`
- Add redirect URLs:
  - `https://music.joshoit.com/auth/callback`
  - `https://jamin.joshoit.com/auth/callback`
  - `https://joshoit.com/auth/callback`
  - `http://localhost:3000/auth/callback`

Use one shared Supabase project so all apps resolve the same user identity.

## 2) Database schema + RLS

Run migration:
- `supabase/migrations/0001_unified_identity_core.sql`

This creates:
- `profiles` table with `role`, `loyalty_points`, `metadata`
- `bookings`, `schedule_change_requests`
- `loyalty_point_transactions`
- helper tables for admin metrics (`revenue_entries`, `it_tickets`)
- RLS policies (self access + admin global visibility)

## 3) Environment variables

Copy `.env.example` to `.env.local` and fill values.

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_COOKIE_DOMAIN` (set to `.joshoit.com` for shared subdomain auth)
- `RESEND_API_KEY`
- `WELCOME_EMAIL_FROM`
- `BOOKING_CONFIRM_WEBHOOK_SECRET`

## 4) Run locally

```bash
npm install
npm run dev
```

## 5) JoSho Points engine

Endpoints:
- `POST /api/points` (admin-only award endpoint)
- `POST /api/bookings/confirm` (webhook; booking confirmation awards +50 points)
- `POST /api/bookings/request-change` (musician/admin creates schedule-change request)

## 6) Role-based dashboard

`/dashboard` auto-adapts by `profiles.role`:
- `admin` -> Global Command Center
- `musician` -> feed, bookings, upcoming, schedule change request
- `client` / `user` -> IT project status, saved listings, points card

Shared sidebar/navigation is provided via Next.js layout group:
- `src/app/(dashboard)/layout.tsx`

## 7) Vercel deployment

Deploy this app directory (`josho-hub`) as a Vercel project.

Map domains:
- `music.joshoit.com` -> this app
- future apps (example `jamin.joshoit.com`) can reuse the same Supabase Auth + DB.
