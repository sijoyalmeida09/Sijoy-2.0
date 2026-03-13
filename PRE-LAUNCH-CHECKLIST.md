# Pre-Launch Checklist — Last Engineer Sign-Off

Use this list to provide everything needed to go live. **Do not commit secrets (passwords, API keys) to the repo.** Use environment variables, GitHub Secrets, or local `.env` only.

---

## 1. PERSONAL SITE (GitHub Pages)

### 1.1 Assets You Must Add

| Item | Path | Notes |
|------|------|--------|
| **Resume PDF** | `assets/sijoy-resume.pdf` | Button "Resume ↓" and "Download Resume" point here. Use your current 1–2 page resume. |
| **OG image** (optional) | `assets/og-image.png` | 1200×630 px. Shows when link is shared in LinkedIn/DM/email. Dark bg + your name + tagline is enough. |
| **Favicon** (optional) | `assets/favicon.ico` | 32×32 or 16×16. Browser tab icon. |

If `assets/` is missing, create it and add at least the PDF. The site works without OG image and favicon (fallback to no image / default icon).

### 1.2 GitHub Pages — Make Site Live

1. In GitHub: **Repository → Settings → Pages**.
2. Under **Build and deployment**:
   - **Source:** GitHub Actions.
3. Push to `main` (with `index.html` and optionally `assets/`). The workflow `.github/workflows/deploy.yml` will run and deploy.
4. Live URL: **`https://sijoyalmeida09.github.io/Sijoy-2.0/`** (or your repo name if different).

No Hostinger is involved for the personal site — it is 100% GitHub Pages (static files only).

### 1.3 Optional: Live YouTube Stats

To show live subscriber/view counts:

1. Get your **YouTube Channel ID** (e.g. from YouTube Studio → Settings → Advanced, or from the channel URL `youtube.com/channel/UC...`).
2. Create a **YouTube Data API v3** key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/) → Create project (or use existing) → **APIs & Services** → **Enable API** → search **YouTube Data API v3** → Enable.
   - **Credentials** → **Create credentials** → **API key**.
   - Restrict the key: **Application restrictions** → **HTTP referrers** → add `https://sijoyalmeida09.github.io/*` (and `http://localhost:*` if you test locally).
3. In `index.html`, find the commented block `// === LIVE STATS: YouTube` and:
   - Set `YT_KEY='your_api_key'` and `YT_CHANNEL='UC...'`.
   - Uncomment the whole `fetch(...)` block.

**Important:** The API key will be visible in the page source. Restricting it to your referrer is what keeps it safe.

---

## 2. JOSHO OPERATIONS SYSTEM (Overnight Agents + Email)

This runs on your machine (or a server) and uses **Hostinger for email only**. No Hostinger hosting is required for the site.

### 2.1 Hostinger Details Required

Get these from **Hostinger → hPanel → Email Accounts** (or **Advanced → Email**).

| What you need | Where it goes | Used for |
|---------------|----------------|----------|
| **SMTP server** | `josho-ops/.env` → `SMTP_HOST` | Sending (e.g. `smtp.hostinger.com`) |
| **SMTP port** | `SMTP_PORT` | Usually `465` (SSL) |
| **SMTP username** | `SMTP_USER` | Full email, e.g. `sijoy@joshoit.com` |
| **SMTP password** | `SMTP_PASS` | App password or account password Hostinger gives you |
| **IMAP server** (if you use inbound) | `IMAP_CONTACT_HOST` etc. | Often `imap.hostinger.com`, port `993` |
| **IMAP username/password** | `IMAP_CONTACT_USER`, `IMAP_CONTACT_PASS` | Same as or different from SMTP, per mailbox |

Typical Hostinger values:

- **SMTP:** `smtp.hostinger.com`, port `465`, SSL on.
- **IMAP:** `imap.hostinger.com`, port `993`, SSL on.

If you have separate mailboxes (e.g. `contact@`, `support@`, `careers@`), create one set of vars per mailbox: `IMAP_CONTACT_*`, `IMAP_SUPPORT_*`, `IMAP_CAREERS_*`.

### 2.2 Create `.env` for josho-ops

```bash
cd josho-ops
cp .env.example .env
```

Edit `.env` and set at least:

- `SMTP_USER` = your sending address (e.g. `sijoy@joshoit.com`)
- `SMTP_PASS` = Hostinger email password (or app password if enabled)
- `NOTIFY_EMAIL` = where the morning review is sent (e.g. `sijoy@joshoit.com`)

Optional (if you use inbound/IMAP):

- `IMAP_CONTACT_HOST`, `IMAP_CONTACT_USER`, `IMAP_CONTACT_PASS`
- Same for `IMAP_SUPPORT_*` and `IMAP_CAREERS_*` if you use those boxes.

### 2.3 Install and Test (josho-ops)

```bash
cd josho-ops
npm install
npm run test-email
```

If `test-email` sends a message to `NOTIFY_EMAIL`, SMTP is good. Then you can run the full pipeline once manually:

```bash
npm run pipeline
```

### 2.4 Schedule Overnight Run (Windows)

1. Open **Task Scheduler**.
2. **Create Basic Task** → Name: e.g. "JoSho Overnight Agents".
3. Trigger: **Daily**, time **2:00 AM**.
4. Action: **Start a program**.
   - Program: `C:\Sijoy_2.0\overnight-agents.bat` (or `C:\Sijoy_2.0\josho-ops\overnight-agents.bat` if you call that one).
   - Start in: `C:\Sijoy_2.0` (or `C:\Sijoy_2.0\josho-ops`).
5. Finish. Optionally: **Properties** → **Run whether user is logged on or not** (and set user/password) so it runs overnight.

---

## 3. INFO NEEDED FROM YOU (Summary)

| # | Info | Where / Why |
|---|------|-------------|
| 1 | Resume PDF file | Add to `assets/sijoy-resume.pdf` so site buttons work. |
| 2 | Hostinger SMTP: host, port, user, password | In `josho-ops/.env` so the ops system can send email and morning review. |
| 3 | (Optional) Hostinger IMAP for contact@ / support@ / careers@ | In `josho-ops/.env` if you want inbound automation. |
| 4 | (Optional) YouTube API key + Channel ID | In `index.html` (commented block) for live subs/views. |
| 5 | (Optional) OG image + favicon | In `assets/` for link preview and tab icon. |

---

## 4. HOSTINGER QUICK REFERENCE

- **SMTP (sending):** Host `smtp.hostinger.com`, Port `465`, SSL ✓. Use full email as username and the password from the email account.
- **IMAP (receiving):** Host `imap.hostinger.com`, Port `993`, SSL ✓. Same user/pass as the mailbox.
- If 2FA is on for the Hostinger account, use an **Application-specific password** for SMTP/IMAP if Hostinger provides one, or a dedicated mailbox for automation.

---

## 5. GO-LIVE ORDER

1. Add `assets/sijoy-resume.pdf` (required for resume buttons).
2. Push to `main` → GitHub Actions deploys the site.
3. In GitHub: **Settings → Pages** → Source: **GitHub Actions** (if not already).
4. Open `https://sijoyalmeida09.github.io/Sijoy-2.0/` and test.
5. For overnight agents: fill `josho-ops/.env` with Hostinger SMTP (and IMAP if used), run `npm run test-email`, then `npm run pipeline` once. Then add the Task Scheduler job for 2:00 AM.

After that, the site is live and the ops system is ready to run overnight once scheduled.
