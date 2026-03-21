# GigSalad — Complete Competitor Analysis
> Saved from Musicsalad research folder | March 2026
> Use as reference for building Sohaya — the Vasaikar entertainment marketplace

---

## 1. Company Overview

| Fact | Detail |
|------|--------|
| Tagline | "The easiest way to find and book talent" / "Book something awesome®" |
| Scale | 110,000+ providers, 500+ categories, ~1 million pages |
| Geography | US + Canada |
| Company Size | 11–50 employees |
| Business Model | Dual revenue: membership subscriptions + transaction fees |
| Daily Volume | 8,500+ new leads sent per day |
| Annual Earnings | $25 million total member earnings over last year |

---

## 2. Main Categories (4 Top-Level)

1. **Musical Acts** — Bands, DJs, Ensembles, Singers, Soloists, Wedding Musicians
2. **Entertainers** — Children's, Comedians, Dancers, Magicians
3. **Speakers** — Athletes, Authors, Emcees, Business Leaders
4. **Event Services** — Bartenders, Photographers, Rentals, Wedding Services

### Musical Acts — Full Subcategory Tree
- **Bands (30+ types):** Acoustic, Alternative, Big Bands, Blues, Classic Rock, Country, Cover, Dance, Disco, Folk, Funk, Indie, Jazz, Mariachi, Motown, Oldies, Party, Pop, R&B, Rock, Soul, Steel Drum, Swing, Top 40, Tribute, Wedding Bands
- **DJs (9):** Bar Mitzvah, Club, Event, Karaoke, Kids, Mobile, Prom, Radio, Wedding
- **Solo Musicians (22+):** Accordion, Bagpipers, Cellists, Guitarists, Harpists, Pianists, Saxophone, Violin, etc.
- **Singers (22+):** A Cappella, Barbershop, Carolers, Choirs, Classical, Country, Gospel, Hip Hop, Jazz, Pop, R&B, Wedding
- **World & Cultural (22+):** African, Cajun, Celtic, Cuban, Flamenco, Hawaiian, Latin, Mariachi, Reggae, Salsa

### Entertainers — Key Sub-types
Acrobats, Balloon Twisters, Belly Dancers, Caricaturists, Clowns, Comedians, Face Painters, Fire Dancers, Jugglers, Magicians, Stilt Walkers, Wedding Entertainers

### Event Services — Key Sub-types
Bartenders, Caterers, Event Photographers, Makeup Artists, Photo Booths, Sound Technicians, Videographers, Wedding Planners

---

## 3. Membership & Pricing Model

### Three Tiers

| Feature | Free | Pro | Featured |
|---------|------|-----|----------|
| Price | $0 | $139/3mo ($229/6mo, $359/12mo) | $169/3mo ($289/6mo, $479/12mo) |
| Provider service fee | 5% | 2.5% | 2.5% |
| Lead volume vs free | baseline | 16x more | 28x more |
| Visibility | Low | High | Highest |
| Client phone numbers | No | Yes | Yes |
| Lead insights | No | Yes | Yes |
| Categories | Up to 2 | Up to 15 | Up to 20 |
| Max deposit accepted | $500 | $1,000 | $2,000 |
| Photos | 10 | 50 | 100 |

- All tiers: video/audio samples included
- Memberships auto-renew (3, 6, or 12 month intervals)
- Minimum 3-month commitment — no monthly option
- Intro promo: "50% off first payment" (observed)
- Monthly equivalent: Pro ~$46/mo, Featured ~$56/mo

### Off-Platform Booking Fees (Mark as Booked)
| Tier | Fee | Minimum |
|------|-----|---------|
| Free | 12.5% | $10 |
| Pro | 10% | $10 |
| Featured | 10% | $10 |

**Client Service Fee:** Charged separately on top of quoted price (exact % not publicly disclosed — estimated ~10%)

---

## 4. Booking Flow (Step-by-Step)

### Client Side
1. Search by category + location OR submit general quote request
2. Browse vendor cards (photo, rating, verified bookings count, price range)
3. Click "Fast free quote" on chosen profile(s)
4. Fill event form: event type, date, duration, indoor/outdoor, guest count, notes
5. Receive quotes from providers (usually within 2.5 days average)
6. Compare quotes, message providers
7. Click "Book Now" on chosen quote
8. Pay FULL amount at time of booking (deposit + balance + client service fee)
9. Event happens
10. Leave review

### Provider Side
1. Receive lead notification (email + SMS + in-app)
2. Read lead details + Lead Insights (paid: who else responded, how many quotes sent)
3. Send quote: fee, deposit amount, cancellation policy, services description, expiry date
4. Client accepts → booking confirmed
5. Receive deposit payout (2 business days after booking)
6. Perform gig
7. Receive balance payout (1–2 business days after event)

---

## 5. Payment & Payout System

### Collection
- GigSalad collects full payment from client at booking time
- Methods: credit card, PayPal
- GigSalad acts as escrow/intermediary

### Two-Installment Payout to Providers

| Payment | When Released | Direct Deposit Wait |
|---------|--------------|---------------------|
| Deposit | After fraud screening complete | 2 business days |
| Balance | 1–2 days after event | 1 business day |

- Non-refundable deposit → released immediately after booking
- Refundable deposit → held until cancellation window closes
- **New members:** ALL deposits held until first event successfully completed

### Provider Payout Methods
1. Direct deposit (fastest — recommended)
2. PayPal (US only; GigSalad covers PayPal fees)
3. Check by mail (discontinued for new US members)

### Tax
- US providers: W-9 required; 1099-K issued if $600+ earned in a year

---

## 6. Lead System

### Two Lead Types
1. **Direct Leads** — Client searched + clicked on specific profile → tagged "direct lead"
2. **Secondary Leads** — Client submitted general request → GigSalad distributes to best-match providers

### Lead Distribution Algorithm (Ranked Priority)
1. Category match (highest)
2. Proximity to event location (highest)
3. Recent bookings (last 60 days weighted heavily)
4. Response rate + speed
5. Number of competing requests for same date
6. Profile completeness (PromoKit)
7. Star rating

- System selects best 5–10 profiles per lead
- Free members with no recent booking get more secondary leads by default

### Lead Insights (Paid Members Only)
- How many providers responded
- How many quotes sent
- How many active quotes remain
- Whether you were the only one contacted
- Lead origin tag (search, direct, widget, outside gig)

---

## 7. Search Results Page Structure

**URL format:** `gigsalad.com/{Category}/{Subcategory}/{State}/{City}`

### Card Components
- Profile photo (landscape)
- FEATURED badge (if paid + featured member)
- Top Performer badge (if earned)
- Name + star rating + review count
- Verified bookings count
- Location + distance from search
- Category label
- Price range or "Contact for rates"
- Client testimonial excerpt
- "Fast free quote" button

### Ranking Order
1. Featured + Top Performer + high verified bookings
2. Featured (no Top Performer)
3. Regular with reviews + verified bookings
4. Regular without reviews

### SEO Content on Each Page
- H1 with count + location + category
- Quick facts sidebar (quotes sent, popularity rank, avg rating, booking time, state rank)
- 4 paragraphs of unique location-specific content
- Related categories links
- Nearby cities links

---

## 8. Vendor Profile Page

**URL format:** `gigsalad.com/{vendor_slug}_{city}`

### Right Column (Sticky Sidebar)
- Circular avatar photo
- Star rating + review count
- Location
- Primary category
- Price or "Contact for rates"
- Travel radius (e.g., "Travels up to 120 miles")
- CTA: "Get a free quick quote" (purple, prominent)
- "Save to my favorites" (heart icon)

### Profile Content
- Large banner hero image
- Overview/description text
- Photo gallery
- Video/audio samples
- Reviews section (Verified + unverified)
- Booking information (price, categories, calendar)

### Profile Completeness ("PromoKit")
- Tracked as percentage
- Higher completeness = better ranking
- Factors: photos, videos, audio, description, pricing, calendar, categories

---

## 9. Review System

| Fact | Detail |
|------|--------|
| Types | Verified (booked through GigSalad) + Unverified (any client) |
| Structure | 1–5 stars, title, body, "Hired as" tag |
| Collection | Auto-email after event + manual review link |
| Sorting | Verified reviews from last 90 days appear first |

### Dispute Process
- Provider can dispute reviews → GigSalad mediates

---

## 10. Cancellation Policy System

- Default: Non-refundable deposit + refundable balance
- Providers set custom policy per quote
- Cancellation window: configurable (e.g., 14 days before event)
- **If PROVIDER cancels:** Client gets FULL refund regardless of policy (Worry-Free Guarantee)
- **New members:** All deposits held until first successful event

### Refund Rules After Dispute
- No-show confirmed → full refund
- Quality disputes → negotiation; partial refunds not guaranteed
- Chargeback handling: GigSalad manages with card company

---

## 11. Top Performer Badge

### Criteria (Assessed Monthly)
1. Average review rating ≥ 4.8 stars
2. Respond to ≥ 80% of leads within 24 hours (last 3 months)
3. Book ≥ 1 gig through GigSalad every 3 months

### Benefits
- More leads
- Higher search ranking (within membership tier)
- Badge displayed on profile
- Cannot be purchased

### Ranking Note
- Free Top Performer still appears AFTER all paid members
- Featured Top Performer appears FIRST among Featured members

---

## 12. Provider Tools Suite

| Tool | Purpose |
|------|---------|
| Saved Quotes | Pre-built quote templates with pricing + cancellation policy |
| Saved Messages | Pre-written message templates for fast responses |
| Quote Widget | Embeddable widget for provider's own website |
| Outside Gig Tool | Import off-platform leads into GigSalad |
| Lead Preferences | Filter leads by event type, distance, budget |
| Calendar | Month/Week/Day/List views; Google + iCloud sync |
| Dashboard | Stats: booking dollars, leads, quotes, close rate, Top Performer status |

### Dashboard Stats Tracked
- Booking dollars earned
- Total leads received
- Total quotes sent
- Total bookings
- Close rate (quotes → bookings %)
- Profile visits (30 days, 90 days, all time)

---

## 13. SEO Architecture

### URL Patterns
- Search: `/Music-Groups/Wedding-Band/IA/Council-Bluffs`
- Profile: `/them_uke_boys_omaha`
- Category browse: `/book-music`, `/book-entertainers`, `/book-speakers`, `/book-services`

### Page Title Patterns
- Search: "10 Best {Category} for Hire in {City}, {State} | GigSalad"
- Profile: "Hire {Name} - {Category} in {City}, {State} | GigSalad"
- Category: "{Category} for Hire Near Me (Updated {Month} {Year}) | GigSalad"

### Scale
- ~1 million pages
- Nearly every US city × every category has its own indexed page
- Each page has unique local content, nearby cities links, related categories

### Technical
- HTTPS everywhere
- PCI compliant
- Quarterly security audits
- Cloudflare / Akamai bot protection
- No stored card/bank info

---

## 14. Business Logic Map (State Machine)

### Event Types Supported (86)
Birthday (Adult/Child/Teen), Cocktail Party, Corporate Event, Dinner Party, Festival, Fundraiser, Grand Opening, Holiday Party (Christmas/Easter/Halloween/New Year), House Party, Launch Party, Nightclub, Parade, Prom, Quinceañera, Rehearsal Dinner, Religious Celebration, Retirement Party, Reunion, School Assembly, Wedding (Ceremony/Reception/Cocktail Hour/Engagement), and more.

### Platform Enforcement
- All bookings MUST go through platform (ToS violation otherwise)
- Three-strike policy for off-platform steering → account removal
- Exceptions: nonprofits, government, schools → Mark as Booked + higher fee

---

## 15. Sohaya Competitive Positioning

### What GigSalad Does NOT Have
- AI-first search (LLM natural language query)
- India-specific categories (Sangeet bands, Ghazal singers, Bharatnatyam, Sufi, Qawwali, Classical)
- UPI / Razorpay payment support
- Hindi/Marathi language support
- Vasaikar hyperlocal positioning
- "Go Live" instant gig / real-time artist availability
- WhatsApp-native lead notifications
- Artist package bundles ("palette" — save 20% booking a band + DJ together)
- No GoLive GPS feature for spontaneous events
- No invisible commission model (GigSalad shows fees transparently)

### What to Copy Directly
- Two-step payout: deposit released after booking, balance after event
- Verified reviews (only from platform bookings)
- Top Performer badge system (rating ≥ 4.8 + response rate + booking frequency)
- Profile completeness tracking → search ranking boost
- Lead Insights showing competitive intelligence
- Saved quotes + saved message templates
- Calendar availability management
- Outside gig import tool
- Quote expiry (7-day default)
- Dual fee structure (lower fee for paying members)

### Sohaya's Moat
1. **Language + Culture** — Hindi, Marathi, Konkani event categories (Sangeet, Mehendi, Ganpati)
2. **UPI-native payments** — No card required; every Indian can pay
3. **AI Concierge** — "I need a Bollywood band for my daughter's wedding in Mumbai ₹2L" → instant results
4. **Hyperlocal** — Start Vasai-Virar, expand radially (Mumbai, Thane, Pune)
5. **Go Live** — Real-time GPS-based artist availability (no equivalent on GigSalad)
6. **WhatsApp** — Booking confirmations + lead alerts on WhatsApp, not just email

---

## 16. COO Assessment (from internal report, March 2026)

> "JoSho IT has built exceptional infrastructure and planning documentation, but the music marketplace product itself remains pre-revenue with zero live users, zero onboarded providers, and zero completed bookings."

### Key Risks Identified
1. Pre-revenue with $350–500/month burn (Cursor, Claude, Railway, Supabase, domains)
2. Backend-first trap — infrastructure built before any real user validated the concept
3. Scope creep — too many features planned before first booking
4. Runway entirely from personal savings / IT consulting income
5. No live onboarded artists yet

### COO Recommendation
> Freeze all new infrastructure work. Redirect 100% of engineering time to completing the minimum viable booking flow that can accept real money from a real client.

---

*Analysis compiled from: 13 research documents + GigSalad scrape data + COO internal report*
*Saved: March 2026 | Use for Sohaya product decisions*
