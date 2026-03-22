"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArtistCard } from "@/components/music/artist-card";
import { ArtistModal } from "@/components/music/artist-modal";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface ArtistRow {
  id: string;
  stageName: string;
  bio: string | null;
  eventRate: number | null;
  city: string;
  profilePhoto: string | null;
  avgRating: number;
  totalBookings: number;
  featured: boolean;
  available: boolean;
  genres: string[];
  genreSlugs: string[];
  instruments: string[];
}

interface DiscoverClientProps {
  artists: ArtistRow[];
  genres: { slug: string; name: string }[];
  initialDate?: string;
}

interface Package {
  id: string;
  name: string;
  tagline: string;
  vibe: string;
  instruments: string[];
  priceRange: string;
  duration: string;
  highlight: boolean;
  matchKeyword: string;
}

interface ParsedIntent {
  eventType: string;
  date: string;
  timeRange: string;
  genres: string[];
  vibe: string;
  raw: string;
}

/* ─────────────────────────────────────────
   Intent Parser — extracts meaning from query
───────────────────────────────────────── */
function parseIntent(query: string): ParsedIntent {
  const q = query.toLowerCase();

  // Event type
  const eventMap: Record<string, string> = {
    communion: "communion", baptism: "communion", christening: "communion",
    wedding: "wedding", sangeet: "wedding", reception: "wedding", nikah: "wedding",
    birthday: "birthday", bday: "birthday",
    corporate: "corporate", office: "corporate", conference: "corporate",
    concert: "concert", performance: "concert",
    party: "party", celebration: "party",
    funeral: "funeral", memorial: "funeral",
    anniversary: "anniversary",
  };
  let eventType = "general";
  for (const [k, v] of Object.entries(eventMap)) {
    if (q.includes(k)) { eventType = v; break; }
  }

  // Date
  const dateMatch = q.match(/(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s*(\d{2,4})?/i)
    || q.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  const date = dateMatch ? dateMatch[0] : "";

  // Time
  const timeMatch = q.match(/(\d{1,2}(?::\d{2})?(?:\s?[ap]m)?)\s*(?:to|-|–)\s*(\d{1,2}(?::\d{2})?(?:\s?[ap]m)?)/i)
    || q.match(/(\d{1,2})\s*(?:to|-|–)\s*(\d{1,2})/);
  const timeRange = timeMatch ? `${timeMatch[1]} – ${timeMatch[2]}` : "";

  // Genre keywords
  const genreKeywords = ["bollywood", "sufi", "classical", "gospel", "folk", "jazz",
    "western", "edm", "instrumental", "fusion", "qawwali", "ghazal", "vasaikar"];
  const genres = genreKeywords.filter((g) => q.includes(g));

  // Vibe
  let vibe = "elegant";
  if (q.includes("fun") || q.includes("party") || q.includes("dance")) vibe = "energetic";
  if (q.includes("quiet") || q.includes("soft") || q.includes("background") || q.includes("lounge")) vibe = "ambient";
  if (q.includes("spiritual") || q.includes("devotion") || q.includes("prayer") || q.includes("church") || q.includes("communion")) vibe = "devotional";
  if (q.includes("sad") || q.includes("memorial") || q.includes("funeral")) vibe = "solemn";

  return { eventType, date, timeRange, genres, vibe, raw: query };
}

/* ─────────────────────────────────────────
   Package Generator — themed bundles from intent
───────────────────────────────────────── */
function generatePackages(intent: ParsedIntent): Package[] {
  const { eventType, genres, vibe } = intent;

  const ALL: Record<string, Package[]> = {
    communion: [
      { id: "c1", name: "Sacred Strings Ensemble", tagline: "Timeless devotional atmosphere", vibe: "Devotional · Spiritual", instruments: ["🎻 Violin", "🎶 Flute", "🎸 Guitar"], priceRange: "₹8,000 – 14,000", duration: "3–4 hrs", highlight: true, matchKeyword: "communion" },
      { id: "c2", name: "Gospel Celebration Band", tagline: "Uplifting praise & worship energy", vibe: "Gospel · Praise", instruments: ["🎤 Vocals", "🎹 Keyboard", "🥁 Drums"], priceRange: "₹10,000 – 18,000", duration: "2–3 hrs", highlight: false, matchKeyword: "communion" },
      { id: "c3", name: "Vasaikar Blessing Choir", tagline: "Local roots, devotional heart", vibe: "Folk · Devotional", instruments: ["🎤 3 Vocalists", "🥁 Tabla", "🎹 Harmonium"], priceRange: "₹6,000 – 10,000", duration: "2 hrs", highlight: false, matchKeyword: "communion" },
      { id: "c4", name: "Instrumental Blessing", tagline: "Peaceful background sacred music", vibe: "Classical · Ambient", instruments: ["🎶 Flute", "🥁 Tabla", "🎹 Harmonium"], priceRange: "₹5,000 – 8,000", duration: "2–4 hrs", highlight: false, matchKeyword: "communion" },
      { id: "c5", name: "Contemporary Worship Duo", tagline: "Modern Christian praise music", vibe: "Contemporary · Worship", instruments: ["🎸 Acoustic Guitar", "🎤 Vocals"], priceRange: "₹4,000 – 7,000", duration: "1.5–2 hrs", highlight: false, matchKeyword: "communion" },
    ],
    wedding: [
      { id: "w1", name: "Royal Bollywood Sangeet", tagline: "Full filmi grandeur — dance-floor ready", vibe: "Bollywood · Festive", instruments: ["🎤 Lead Vocalist", "🥁 Dhol", "🎹 Keys", "🎸 Guitar"], priceRange: "₹20,000 – 40,000", duration: "4 hrs", highlight: true, matchKeyword: "wedding" },
      { id: "w2", name: "Sufi Night Experience", tagline: "Soulful Qawwali under the stars", vibe: "Sufi · Spiritual", instruments: ["🎤 Qawwali Vocals", "🥁 Tabla", "🎹 Harmonium", "🎶 Flute"], priceRange: "₹15,000 – 25,000", duration: "3 hrs", highlight: false, matchKeyword: "wedding" },
      { id: "w3", name: "DJ + Live Band Fusion", tagline: "Best of both worlds — live & electronic", vibe: "Fusion · Modern", instruments: ["🎧 DJ", "🎸 Guitarist", "🎤 Vocalist"], priceRange: "₹25,000 – 50,000", duration: "5 hrs", highlight: false, matchKeyword: "wedding" },
      { id: "w4", name: "Vasaikar Folk Night", tagline: "Traditional Vasai rhythms and charm", vibe: "Folk · Regional", instruments: ["🥁 Dholki", "🎤 Folk Vocalist", "🎶 Flute"], priceRange: "₹8,000 – 15,000", duration: "3 hrs", highlight: false, matchKeyword: "wedding" },
      { id: "w5", name: "Acoustic Romance Duo", tagline: "Intimate, elegant, unforgettable", vibe: "Acoustic · Romantic", instruments: ["🎸 Guitar", "🎤 Vocalist"], priceRange: "₹5,000 – 10,000", duration: "2 hrs", highlight: false, matchKeyword: "wedding" },
    ],
    birthday: [
      { id: "b1", name: "Party Starter Experience", tagline: "High-energy DJ set with live MC", vibe: "EDM · Party", instruments: ["🎧 DJ", "🎤 MC"], priceRange: "₹8,000 – 15,000", duration: "3 hrs", highlight: true, matchKeyword: "birthday" },
      { id: "b2", name: "Bollywood Dance Night", tagline: "Chart-toppers all night long", vibe: "Bollywood · Dance", instruments: ["🎤 Vocalist", "🎹 Keys", "🥁 Drums"], priceRange: "₹12,000 – 20,000", duration: "3 hrs", highlight: false, matchKeyword: "birthday" },
      { id: "b3", name: "Chill Acoustic Evening", tagline: "Cozy vibes, great music, no fuss", vibe: "Acoustic · Mellow", instruments: ["🎸 Acoustic Guitar", "🎤 Vocals"], priceRange: "₹4,000 – 8,000", duration: "2 hrs", highlight: false, matchKeyword: "birthday" },
    ],
    corporate: [
      { id: "co1", name: "Jazz Lounge Quartet", tagline: "Sophisticated background elegance", vibe: "Jazz · Lounge", instruments: ["🎷 Saxophone", "🎹 Piano", "🎸 Bass", "🥁 Brushed Drums"], priceRange: "₹15,000 – 28,000", duration: "3 hrs", highlight: true, matchKeyword: "corporate" },
      { id: "co2", name: "Classical Ambiance Trio", tagline: "Refined classical for premium events", vibe: "Classical · Elegant", instruments: ["🎻 Violin", "🎶 Flute", "🎹 Keys"], priceRange: "₹10,000 – 20,000", duration: "3 hrs", highlight: false, matchKeyword: "corporate" },
      { id: "co3", name: "Corporate Band Fusion", tagline: "Live music that fills the room", vibe: "Fusion · Professional", instruments: ["🎤 Vocalist", "🎸 Guitar", "🎹 Keys", "🥁 Drums"], priceRange: "₹20,000 – 35,000", duration: "4 hrs", highlight: false, matchKeyword: "corporate" },
    ],
    party: [
      { id: "p1", name: "Full Party Setup", tagline: "Complete sound + DJ + lighting", vibe: "EDM · High-energy", instruments: ["🎧 DJ", "💡 Lighting", "🔊 PA System"], priceRange: "₹15,000 – 30,000", duration: "4 hrs", highlight: true, matchKeyword: "party" },
      { id: "p2", name: "Bollywood Mix Night", tagline: "Non-stop Bollywood hits live", vibe: "Bollywood · Dance", instruments: ["🎤 Vocalist", "🎧 DJ", "🥁 Drums"], priceRange: "₹12,000 – 22,000", duration: "3 hrs", highlight: false, matchKeyword: "party" },
    ],
    general: [
      { id: "g1", name: "Bollywood Fusion Band", tagline: "Crowd-pleasing Bollywood with a live twist", vibe: "Bollywood · Festive", instruments: ["🎤 Vocalist", "🎸 Guitar", "🥁 Drums", "🎹 Keys"], priceRange: "₹15,000 – 28,000", duration: "3 hrs", highlight: true, matchKeyword: "" },
      { id: "g2", name: "Instrumental Lounge", tagline: "Background music for any event", vibe: "Instrumental · Ambient", instruments: ["🎶 Flute", "🥁 Tabla", "🎹 Keys"], priceRange: "₹6,000 – 12,000", duration: "2–3 hrs", highlight: false, matchKeyword: "" },
      { id: "g3", name: "Vasaikar Folk Troupe", tagline: "Authentic local music experience", vibe: "Folk · Regional", instruments: ["🥁 Dholki", "🎤 Vocals", "🎶 Flute"], priceRange: "₹5,000 – 10,000", duration: "2 hrs", highlight: false, matchKeyword: "" },
      { id: "g4", name: "Singer + Acoustic Duo", tagline: "Simple, elegant, memorable", vibe: "Acoustic · Romantic", instruments: ["🎸 Guitar", "🎤 Vocals"], priceRange: "₹4,000 – 8,000", duration: "2 hrs", highlight: false, matchKeyword: "" },
    ],
  };

  // Genre-boosted overlay
  const genreOverrides: Package[] = [];
  if (genres.includes("bollywood") || genres.includes("fusion")) {
    genreOverrides.push({ id: "ov1", name: "Bollywood Fusion Special", tagline: "Custom Bollywood selection for your event", vibe: "Bollywood · Custom", instruments: ["🎤 Vocalist", "🎸 Guitar", "🎹 Keys", "🥁 Dhol"], priceRange: "₹12,000 – 25,000", duration: "3–4 hrs", highlight: true, matchKeyword: "bollywood" });
  }
  if (genres.includes("instrumental")) {
    genreOverrides.push({ id: "ov2", name: "Instrumental Bollywood Fusion", tagline: "Famous Bollywood tunes — no lyrics, all soul", vibe: "Instrumental · Film", instruments: ["🎶 Flute", "🥁 Tabla", "🎻 Violin", "🎹 Keys"], priceRange: "₹8,000 – 16,000", duration: "2–3 hrs", highlight: false, matchKeyword: "instrumental" });
  }

  const base = ALL[eventType] || ALL["general"];
  const combined = [...genreOverrides, ...base].slice(0, 6);
  return combined;
}

/* ─────────────────────────────────────────
   Artist filter by intent
───────────────────────────────────────── */
function filterArtistsByIntent(artists: ArtistRow[], intent: ParsedIntent) {
  const { eventType, genres } = intent;

  const genreMap: Record<string, string[]> = {
    communion: ["gospel", "classical", "folk", "vasaikar"],
    wedding: ["bollywood", "sufi", "folk", "western"],
    birthday: ["bollywood", "edm", "western"],
    corporate: ["jazz", "classical", "western"],
    party: ["bollywood", "edm"],
    general: [],
  };

  const targetGenres = [...(genreMap[eventType] || []), ...genres];

  if (targetGenres.length === 0) return artists;

  const matched = artists.filter((a) =>
    targetGenres.some((g) => a.genreSlugs.includes(g))
  );
  const rest = artists.filter((a) =>
    !targetGenres.some((g) => a.genreSlugs.includes(g))
  );

  return [...matched, ...rest];
}

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

function RowHeader({ title, subtitle, viewAllHref }: { title: string; subtitle?: string; viewAllHref?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        <h2 className="text-xl font-black text-white sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-secondary">{subtitle}</p>}
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="text-sm font-medium text-electric hover:text-white">
          View all →
        </Link>
      )}
    </div>
  );
}

function PackageCard({ pkg, eventLabel }: { pkg: Package; eventLabel: string }) {
  return (
    <div className={`relative flex-shrink-0 w-72 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 ${
      pkg.highlight ? "glass-card-red hover:shadow-electric" : "glass-card hover:border-gold/40 hover:shadow-[0_12px_40px_rgba(245,166,35,0.15)]"
    }`}>
      {pkg.highlight && (
        <span className="absolute -top-2.5 left-4 rounded-full bg-electric px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Best Match
        </span>
      )}
      <div className="mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-secondary">{pkg.vibe}</p>
        <h3 className="mt-1 text-base font-black text-white leading-tight">{pkg.name}</h3>
        <p className="mt-1 text-xs text-secondary">{pkg.tagline}</p>
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {pkg.instruments.map((inst) => (
          <span key={inst} className="rounded-full bg-white/[0.08] border border-white/5 px-2.5 py-1 text-[11px] text-secondary">
            {inst}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-gold">{pkg.priceRange}</p>
          <p className="text-[10px] text-muted">{pkg.duration}</p>
        </div>
        <Link
          href={`/discover?event=${encodeURIComponent(eventLabel)}&package=${encodeURIComponent(pkg.name)}`}
          className="rounded-xl bg-gradient-to-r from-gold to-amber-400 px-4 py-1.5 text-xs font-bold text-black transition-all hover:shadow-gold"
        >
          Book →
        </Link>
      </div>
    </div>
  );
}

function HorizontalRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">{children}</div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-josho-bg to-transparent" />
    </div>
  );
}

const EXAMPLE_PROMPTS = [
  "Wedding reception for 200 guests, Bollywood + Sufi, Dec 2025",
  "Corporate dinner at Vasai, elegant jazz background, evening 7–10pm",
  "My daughter's birthday party, fun DJ + live singer, afternoon",
  "Communion ceremony, sacred music, 18 Dec 7–11pm",
  "Rooftop anniversary dinner, acoustic duo, romantic",
  "Band for a church event, gospel and devotional, Sunday morning",
];

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
export function DiscoverClient({ artists }: DiscoverClientProps) {
  const [prompt, setPrompt] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [intent, setIntent] = useState<ParsedIntent | null>(null);
  const [previewArtistId, setPreviewArtistId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("trending");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [budget, setBudget] = useState(50000);

  function handleSubmit(q?: string) {
    const query = q ?? prompt;
    if (!query.trim()) return;
    setPrompt(query);
    const parsed = parseIntent(query);
    setIntent(parsed);
    setSubmitted(true);
  }

  const packages = useMemo(() => intent ? generatePackages(intent) : [], [intent]);

  const filteredArtists = useMemo(() => {
    let list = intent ? filterArtistsByIntent(artists, intent) : artists;
    if (search) list = list.filter((a) => a.stageName.toLowerCase().includes(search.toLowerCase()));
    if (selectedGenres.length) list = list.filter((a) => selectedGenres.some((g) => a.genreSlugs.includes(g)));
    if (budget < 50000) list = list.filter((a) => !a.eventRate || a.eventRate <= budget);
    if (sortBy === "top_rated") list = [...list].sort((a, b) => b.avgRating - a.avgRating);
    if (sortBy === "price_low") list = [...list].sort((a, b) => (a.eventRate ?? 0) - (b.eventRate ?? 0));
    return list;
  }, [artists, intent, search, selectedGenres, budget, sortBy]);

  const bands = filteredArtists.filter((a) =>
    a.instruments.length >= 3 || a.stageName.toLowerCase().includes("band") || a.stageName.toLowerCase().includes("trio") || a.stageName.toLowerCase().includes("quartet")
  );
  const soloArtists = filteredArtists.filter((a) => !bands.includes(a));

  const eventLabel = intent ? intent.raw.slice(0, 60) : "";

  return (
    <main className="min-h-screen bg-josho-bg">
      {previewArtistId && (
        <ArtistModal artistId={previewArtistId} onClose={() => setPreviewArtistId(null)} />
      )}

      {/* ── HERO PROMPT ────────────────────────────────────── */}
      <section className="spotlight-hero relative px-4 py-16 sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute left-1/3 top-1/3 h-80 w-80 rounded-full bg-electric/5 blur-3xl" />
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-electric" />
            <span className="text-xs font-semibold uppercase tracking-widest text-electric">AI-Powered Discovery</span>
          </div>
          <h1 className="mb-4 text-3xl font-black text-white sm:text-5xl leading-tight">
            Describe Your Event.<br />
            <span className="text-gradient-electric">We Build Your Lineup.</span>
          </h1>
          <p className="mb-8 text-secondary">
            Tell us what you need — event type, date, time, vibe — and we&apos;ll curate the perfect musical experience.
          </p>

          {/* Big Prompt Input */}
          <div className="glass-card-red p-2">
            <div className="flex gap-2">
              <textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                placeholder="e.g. Band for communion ceremony, 18 Dec 7–11pm, gospel + Bollywood instrumental..."
                className="flex-1 resize-none rounded-xl bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted outline-none focus:ring-1 focus:ring-electric/40"
              />
              <button
                onClick={() => handleSubmit()}
                disabled={!prompt.trim()}
                className="flex-shrink-0 self-end rounded-xl bg-electric px-5 py-3 text-sm font-bold text-white transition-all hover:bg-red-600 hover:shadow-electric disabled:opacity-40"
              >
                Find →
              </button>
            </div>
          </div>

          {/* Example Prompts */}
          {!submitted && (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  onClick={() => handleSubmit(ex)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-secondary backdrop-blur-sm transition-all hover:border-electric/40 hover:text-white"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">

        {/* ── RESULTS (after query) ───────────────────────── */}
        {submitted && intent && (
          <>
            {/* Intent confirmation strip */}
            <div className="mb-10 flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-3">
              <span className="text-xs text-muted">Your event:</span>
              {intent.eventType !== "general" && (
                <span className="rounded-full bg-electric/15 border border-electric/30 px-3 py-0.5 text-xs font-semibold capitalize text-electric">{intent.eventType}</span>
              )}
              {intent.date && (
                <span className="rounded-full bg-gold/10 border border-gold/30 px-3 py-0.5 text-xs font-semibold text-gold">{intent.date}</span>
              )}
              {intent.timeRange && (
                <span className="rounded-full bg-white/[0.08] border border-white/10 px-3 py-0.5 text-xs text-secondary">{intent.timeRange}</span>
              )}
              {intent.genres.map((g) => (
                <span key={g} className="rounded-full bg-teal/10 border border-teal/20 px-3 py-0.5 text-xs capitalize text-teal">{g}</span>
              ))}
              <button
                onClick={() => { setSubmitted(false); setIntent(null); }}
                className="ml-auto text-xs text-muted hover:text-white"
              >
                ✕ Clear
              </button>
            </div>

            {/* ROW 1 — Curated Packages */}
            <section className="mb-14">
              <RowHeader
                title="✨ Curated Packages for You"
                subtitle={`${packages.length} themed lineups matched to your ${intent.eventType !== "general" ? intent.eventType : "event"}`}
              />
              <HorizontalRow>
                {packages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} eventLabel={eventLabel} />
                ))}
              </HorizontalRow>
            </section>

            {/* ROW 2 — Bands & Groups */}
            {bands.length > 0 && (
              <section className="mb-14">
                <RowHeader
                  title="🎸 Bands & Ensembles"
                  subtitle="Groups of 3+ musicians for a full live experience"
                  viewAllHref="/discover?filter=bands"
                />
                <HorizontalRow>
                  {bands.slice(0, 10).map((a) => (
                    <div key={a.id} className="flex-shrink-0 w-64">
                      <ArtistCard
                        id={a.id}
                        stageName={a.stageName}
                        profilePhoto={a.profilePhoto}
                        genres={a.genres}
                        instruments={a.instruments}
                        avgRating={a.avgRating}
                        totalBookings={a.totalBookings}
                        eventRate={a.eventRate}
                        featured={a.featured}
                        available={a.available}
                        bio={a.bio}
                        city={a.city}
                        onPreview={setPreviewArtistId}
                      />
                    </div>
                  ))}
                </HorizontalRow>
              </section>
            )}

            {/* ROW 3 — Solo Artists */}
            {soloArtists.length > 0 && (
              <section className="mb-14">
                <RowHeader
                  title="🎤 Solo Artists"
                  subtitle="Individual performers — singers, instrumentalists, DJs"
                  viewAllHref="/discover?filter=solo"
                />
                <HorizontalRow>
                  {soloArtists.slice(0, 10).map((a) => (
                    <div key={a.id} className="flex-shrink-0 w-64">
                      <ArtistCard
                        id={a.id}
                        stageName={a.stageName}
                        profilePhoto={a.profilePhoto}
                        genres={a.genres}
                        instruments={a.instruments}
                        avgRating={a.avgRating}
                        totalBookings={a.totalBookings}
                        eventRate={a.eventRate}
                        featured={a.featured}
                        available={a.available}
                        bio={a.bio}
                        city={a.city}
                        onPreview={setPreviewArtistId}
                      />
                    </div>
                  ))}
                </HorizontalRow>
              </section>
            )}

            {/* ROW 4 — All results + advanced filters toggle */}
            <section>
              <div className="mb-5 flex items-center justify-between">
                <RowHeader title="🎵 All Matching Artists" subtitle={`${filteredArtists.length} artists available`} />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`rounded-xl border px-4 py-2 text-xs font-medium transition-all backdrop-blur-sm ${
                    showFilters ? "border-electric/60 bg-electric/10 text-electric" : "border-white/10 bg-white/5 text-secondary hover:border-electric/30"
                  }`}
                >
                  {showFilters ? "Hide Filters" : "Advanced Filters"}
                </button>
              </div>

              {/* Advanced Filters Panel */}
              {showFilters && (
                <div className="mb-6 glass-card p-5">
                  <div className="flex flex-wrap gap-6">
                    {/* Search */}
                    <div className="flex-1 min-w-48">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary">Name Search</label>
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Artist name..."
                        className="w-full glass-input px-3 py-2 text-sm"
                      />
                    </div>
                    {/* Budget */}
                    <div className="flex-1 min-w-48">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary">
                        Max Budget: <span className="text-gold">₹{budget.toLocaleString("en-IN")}</span>
                      </label>
                      <input type="range" min={2000} max={50000} step={1000} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full accent-electric mt-1" />
                    </div>
                    {/* Sort */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary">Sort By</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {[["trending", "Trending"], ["top_rated", "Top Rated"], ["price_low", "Price: Low"]].map(([k, l]) => (
                          <button key={k} onClick={() => setSortBy(k)} className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${sortBy === k ? "bg-electric text-white" : "border border-white/10 text-secondary hover:border-electric/40"}`}>{l}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredArtists.slice(0, 20).map((a) => (
                  <ArtistCard
                    key={a.id}
                    id={a.id}
                    stageName={a.stageName}
                    profilePhoto={a.profilePhoto}
                    genres={a.genres}
                    instruments={a.instruments}
                    avgRating={a.avgRating}
                    totalBookings={a.totalBookings}
                    eventRate={a.eventRate}
                    featured={a.featured}
                    available={a.available}
                    bio={a.bio}
                    city={a.city}
                    onPreview={setPreviewArtistId}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {/* ── DEFAULT STATE (before query) ───────────────── */}
        {!submitted && (
          <>
            {/* Featured / Top Rated Row */}
            {artists.filter((a) => a.featured).length > 0 && (
              <section className="mb-14">
                <RowHeader title="⭐ Featured Artists" subtitle="Hand-picked top performers" viewAllHref="/discover?filter=featured" />
                <HorizontalRow>
                  {artists.filter((a) => a.featured).slice(0, 8).map((a) => (
                    <div key={a.id} className="flex-shrink-0 w-64">
                      <ArtistCard id={a.id} stageName={a.stageName} profilePhoto={a.profilePhoto} genres={a.genres} instruments={a.instruments} avgRating={a.avgRating} totalBookings={a.totalBookings} eventRate={a.eventRate} featured={a.featured} available={a.available} bio={a.bio} city={a.city} onPreview={setPreviewArtistId} />
                    </div>
                  ))}
                </HorizontalRow>
              </section>
            )}

            {/* Top Rated Row */}
            <section className="mb-14">
              <RowHeader title="🏆 Top Rated" subtitle="Highest rated artists on the platform" viewAllHref="/discover?sort=top_rated" />
              <HorizontalRow>
                {[...artists].sort((a, b) => b.avgRating - a.avgRating).slice(0, 10).map((a) => (
                  <div key={a.id} className="flex-shrink-0 w-64">
                    <ArtistCard id={a.id} stageName={a.stageName} profilePhoto={a.profilePhoto} genres={a.genres} instruments={a.instruments} avgRating={a.avgRating} totalBookings={a.totalBookings} eventRate={a.eventRate} featured={a.featured} available={a.available} bio={a.bio} city={a.city} onPreview={setPreviewArtistId} />
                  </div>
                ))}
              </HorizontalRow>
            </section>

            {/* Most Booked Row */}
            <section className="mb-14">
              <RowHeader title="🔥 Most Booked" subtitle="Artists clients keep coming back to" viewAllHref="/discover?sort=trending" />
              <HorizontalRow>
                {[...artists].sort((a, b) => b.totalBookings - a.totalBookings).slice(0, 10).map((a) => (
                  <div key={a.id} className="flex-shrink-0 w-64">
                    <ArtistCard id={a.id} stageName={a.stageName} profilePhoto={a.profilePhoto} genres={a.genres} instruments={a.instruments} avgRating={a.avgRating} totalBookings={a.totalBookings} eventRate={a.eventRate} featured={a.featured} available={a.available} bio={a.bio} city={a.city} onPreview={setPreviewArtistId} />
                  </div>
                ))}
              </HorizontalRow>
            </section>

            {/* Budget Friendly Row */}
            <section className="mb-14">
              <RowHeader title="💚 Budget Friendly" subtitle="Great artists under ₹8,000" viewAllHref="/discover?sort=price_low" />
              <HorizontalRow>
                {[...artists].filter((a) => a.eventRate && a.eventRate <= 8000).sort((a, b) => (a.eventRate ?? 0) - (b.eventRate ?? 0)).slice(0, 10).map((a) => (
                  <div key={a.id} className="flex-shrink-0 w-64">
                    <ArtistCard id={a.id} stageName={a.stageName} profilePhoto={a.profilePhoto} genres={a.genres} instruments={a.instruments} avgRating={a.avgRating} totalBookings={a.totalBookings} eventRate={a.eventRate} featured={a.featured} available={a.available} bio={a.bio} city={a.city} onPreview={setPreviewArtistId} />
                  </div>
                ))}
              </HorizontalRow>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
