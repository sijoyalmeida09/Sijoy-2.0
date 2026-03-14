# Deployment Guide — Sijoy 2.0

## Domains to Check

| Target | URL | What |
|--------|-----|------|
| **joshoit.com** | https://joshoit.com | JoSho IT business homepage |
| **sijoy.joshoit.com** | https://sijoy.joshoit.com | Personal portfolio |
| **GitHub Pages** | https://sijoyalmeida09.github.io/Sijoy-2.0/ | Static mirror |

---

## Current Tech Stack

- **Hostinger** — static HTML (index.html, sijoy.html, resume.html, assets)
- **GitHub Pages** — same static content
- **josho-hub** — Next.js app; run locally (`npm run dev` in josho-hub) or deploy to a Node.js host when ready

---

## What Deploys on Push to `main`

**Trigger:** Changes to `index.html`, `sijoy.html`, `resume.html`, `resume-data/**`, `assets/**`

- **Hostinger:** SSH deploy copies files to joshoit.com and sijoy.joshoit.com
- **GitHub Pages:** Full repo artifact

**Required secrets:** `HOSTINGER_HOST`, `HOSTINGER_USER`, `HOSTINGER_SSH_KEY`, `HOSTINGER_PORT`

---

## josho-hub (music.joshoit.com)

josho-hub needs a Node.js runtime (API routes, auth, Supabase). Hostinger shared hosting and GitHub Pages only serve static files.

**Options when you want it live:**
- **Vercel** — Import this repo, set **Root Directory** to `josho-hub`, add env vars (see below), deploy.
- **Hostinger VPS** — if you have one, run `npm run build && npm start` with PM2
- **Railway / Render** — free tiers with Node.js
- **Run locally** — `cd josho-hub && npm install && npm run dev`

### Vercel: env vars to set

In Vercel → Project → Settings → Environment Variables, add (values from your `.env.local` or `PRIVATE_CREDENTIALS.txt`; never commit them):

| Variable | Required for |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Auth, DB |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth, DB |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin |
| `SUPABASE_COOKIE_DOMAIN` | e.g. `.joshoit.com` |
| `NEXT_PUBLIC_APP_URL` | e.g. `https://music.joshoit.com` |
| `RAZORPAY_KEY_ID` | Payments |
| `RAZORPAY_KEY_SECRET` | Payments |
| `RESEND_API_KEY` | Welcome emails (optional) |
| `WELCOME_EMAIL_FROM` | Optional |
| `BOOKING_CONFIRM_WEBHOOK_SECRET` | Optional |
| `RAZORPAY_WEBHOOK_SECRET` | Payment webhooks (optional) |
| `YOUTUBE_API_KEY` | Optional |
