import Link from "next/link";
import { Header } from "@/components/layout/header";
import { InstantBookingBanner } from "@/components/music/instant-booking-banner";

export default function LandingPage() {
  return (
    <>
      <Header />

      {/* ── SECTION 1: HERO ─────────────────────────────── */}
      <section className="spotlight-hero relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20">
        {/* Ambient background blobs */}
        <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 translate-x-1/2 translate-y-1/2 rounded-full bg-gold/5 blur-3xl" />

        {/* Floating music notes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
          <span className="float-note absolute left-[8%] top-[20%] text-2xl opacity-20" style={{ animationDelay: "0s" }}>🎵</span>
          <span className="float-note absolute left-[85%] top-[30%] text-xl opacity-15" style={{ animationDelay: "1.2s" }}>🎶</span>
          <span className="float-note absolute left-[15%] top-[65%] text-xl opacity-15" style={{ animationDelay: "2.4s" }}>🎸</span>
          <span className="float-note absolute left-[75%] top-[70%] text-2xl opacity-20" style={{ animationDelay: "0.8s" }}>🎹</span>
          <span className="float-note absolute left-[50%] top-[12%] text-xl opacity-10" style={{ animationDelay: "1.8s" }}>🎺</span>
          <span className="float-note absolute left-[92%] top-[55%] text-xl opacity-15" style={{ animationDelay: "3s" }}>🥁</span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Eyebrow */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-electric" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-electric">
              Sohaya — Vasai&apos;s Premier Artist Marketplace
            </span>
          </div>

          {/* H1 */}
          <h1 className="mb-6 text-5xl font-black leading-[1.08] tracking-tight sm:text-7xl lg:text-8xl">
            <span className="text-white">Mumbai&apos;s Best</span>
            <br />
            <span className="text-gradient-electric">Musicians.</span>
            <br />
            <span className="text-white">For Your Event.</span>
          </h1>

          {/* Subtext */}
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-secondary sm:text-xl">
            From Vasai to Andheri — verified singers, bands, DJs, and more.
            One place, one click, instant booking.
          </p>

          {/* Search Bar */}
          <div className="mx-auto mb-8 max-w-3xl">
            <div className="glass-card-red flex flex-col gap-3 p-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/5 px-4 py-3">
                <span className="text-muted">📍</span>
                <span className="text-sm text-secondary">Mumbai / Vasai-Virar</span>
              </div>
              <select className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-secondary outline-none focus:ring-2 focus:ring-electric/50">
                <option value="">Select genre</option>
                <option>Bollywood</option>
                <option>Sufi / Qawwali</option>
                <option>Western / Rock</option>
                <option>Classical</option>
                <option>Gospel / Church</option>
                <option>EDM / DJ</option>
                <option>Vasaikar Folk</option>
              </select>
              <input
                type="date"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-secondary outline-none focus:ring-2 focus:ring-electric/50"
              />
              <Link
                href="/discover"
                className="btn-electric whitespace-nowrap px-8 py-3 text-sm"
              >
                Search
              </Link>
            </div>
          </div>

          {/* Popular Search Pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { icon: "💒", label: "Wedding Band" },
              { icon: "🎧", label: "DJ" },
              { icon: "🎸", label: "Guitarist" },
              { icon: "🥁", label: "Dhol Player" },
              { icon: "🎹", label: "Keyboard" },
              { icon: "🎺", label: "Brass Band" }
            ].map((item) => (
              <Link
                key={item.label}
                href={`/discover?q=${encodeURIComponent(item.label)}`}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-secondary transition-all hover:border-electric/40 hover:text-white hover:bg-electric/10 backdrop-blur-sm"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: TONIGHT BANNER ────────────────────── */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <InstantBookingBanner />
        </div>
      </section>

      {/* ── SECTION 3: HOW IT WORKS ──────────────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-electric">
              Simple Process
            </p>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Three Simple Steps.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Find",
                desc: "Filter by genre, instruments, and budget to find your best match. Watch YouTube videos, read reviews.",
                color: "gold"
              },
              {
                number: "02",
                title: "Book",
                desc: "Confirm date, time, and venue. Pay just 20% advance online. The rest is paid at the event.",
                color: "electric"
              },
              {
                number: "03",
                title: "Enjoy",
                desc: "The artist arrives and performs. Final payment after the event. 100% guaranteed.",
                color: "teal"
              }
            ].map((step) => (
              <div
                key={step.number}
                className="group relative overflow-hidden glass-card p-8 transition-all duration-300 hover:border-electric/30 hover:shadow-electric"
              >
                <div
                  className={`mb-6 text-5xl font-black opacity-20 ${
                    step.color === "gold" ? "text-gold" : step.color === "electric" ? "text-electric" : "text-teal"
                  }`}
                >
                  {step.number}
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-secondary">{step.desc}</p>
                <div
                  className={`absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full ${
                    step.color === "gold" ? "bg-gold" : step.color === "electric" ? "bg-electric" : "bg-teal"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: CATEGORY GRID ─────────────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Artists for Every Occasion
            </h2>
            <p className="mt-3 text-secondary">Wedding, birthday, corporate — all covered.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
            {[
              { icon: "🎤", label: "Singers", sub: "Bollywood, Sufi, Gospel, Classical", count: 48 },
              { icon: "🎸", label: "Guitarists", sub: "Acoustic, Electric, Bass", count: 32 },
              { icon: "🥁", label: "Drummers", sub: "Percussionists, Octopad", count: 21 },
              { icon: "🎹", label: "Keyboard & Piano", sub: "Synth, Keys, Organ", count: 19 },
              { icon: "🎧", label: "DJs", sub: "Wedding, Club, Bollywood", count: 27 },
              { icon: "🎺", label: "Brass & Wind", sub: "Trumpet, Sax, Flute", count: 15 },
              { icon: "🪘", label: "Dhol & Folk", sub: "Dhol, Tabla, Dholki", count: 24 },
              { icon: "🎻", label: "Strings", sub: "Violin, Harmonium", count: 12 }
            ].map((cat) => (
              <Link
                key={cat.label}
                href={`/discover?category=${encodeURIComponent(cat.label)}`}
                className="group relative overflow-hidden glass-card p-6 text-center transition-all duration-300 hover:border-gold/40 hover:shadow-gold"
              >
                <div className="mb-3 text-4xl transition-transform duration-300 group-hover:scale-110">
                  {cat.icon}
                </div>
                <h3 className="mb-1 font-bold text-white">{cat.label}</h3>
                <p className="mb-3 text-xs text-muted">{cat.sub}</p>
                <span className="text-xs font-medium text-teal opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {cat.count} artists available
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: GEAR RENTAL ───────────────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden glass-card-red rounded-3xl">
          <div className="p-8 sm:p-12">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric/10 px-3 py-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-electric">New Feature</span>
            </div>
            <h2 className="mb-3 mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              <span className="text-gradient-electric">Need Gear? Rent It.</span>
            </h2>
            <p className="mb-10 max-w-xl text-secondary">
              Musicians on the platform rent out their gear — amp, mic, keyboard, dhol, light setup, sound system. For a single day, instant booking.
            </p>
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                {
                  icon: "🤝",
                  title: "Musician-to-Musician Rental",
                  desc: "Rent another musician's gear for the day. Verified owners, insured equipment."
                },
                {
                  icon: "🤖",
                  title: "AI Auto-Match System",
                  desc: "AI automatically suggests available gear and artists suited to your event."
                },
                {
                  icon: "🎪",
                  title: "Sound & Light Bundle",
                  desc: "Complete event setup: PA system + stage lighting in one package. One price, no drama."
                }
              ].map((f) => (
                <div key={f.title} className="glass p-5 rounded-xl">
                  <div className="mb-3 text-2xl">{f.icon}</div>
                  <h3 className="mb-2 font-bold text-white">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-secondary">{f.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/gear" className="btn-electric inline-block px-8 py-3 text-sm">
                Browse Gear
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: TRENDING ARTISTS ──────────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white sm:text-3xl">
                🔥 Trending in Vasai-Virar
              </h2>
              <span className="rounded-full border border-teal/30 bg-teal/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal">
                AI Powered
              </span>
            </div>
            <Link href="/discover" className="text-sm font-medium text-electric hover:text-white">
              View all →
            </Link>
          </div>
          {/* Horizontal scroll reel */}
          <div className="relative">
            <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
              {MOCK_TRENDING.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artists/${artist.id}`}
                  className="group relative flex-shrink-0 w-44 overflow-hidden glass-card transition-all duration-300 hover:border-gold/50 hover:shadow-[0_8px_30px_rgba(245,166,35,0.2)] artist-card-hover"
                >
                  <div className="relative aspect-[2/3] bg-black/50">
                    <div className="flex h-full items-center justify-center text-5xl text-electric/40">
                      {artist.emoji}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-josho-bg via-josho-bg/60 to-transparent p-3 pt-8">
                      <p className="font-bold text-white text-sm">{artist.name}</p>
                      <p className="text-[10px] text-gold">{artist.genre}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-gold text-[10px]">★</span>
                        <span className="text-[10px] text-secondary">{artist.rating}</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="btn-electric px-4 py-1.5 text-xs">Book</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* Right fade */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-josho-bg to-transparent" />
          </div>
        </div>
      </section>

      {/* ── SECTION 7: BAND BUILDER UPSELL ───────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Build Your Perfect Band
            </h2>
            <p className="mt-3 text-secondary">Need more than one artist? Try these packages.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                name: "Acoustic Duo",
                desc: "Singer + Guitarist. Perfect for intimate weddings, house parties, and rooftop events.",
                instruments: ["🎤", "🎸"],
                price: "₹4,000 – 8,000"
              },
              {
                name: "Sufi Night Package",
                desc: "Vocalist + Tabla + Harmonium + Flute. Magical atmosphere guaranteed. Corporate and private events.",
                instruments: ["🎤", "🥁", "🎹", "🎺"],
                price: "₹8,000 – 15,000",
                featured: true
              },
              {
                name: "Full Event Setup",
                desc: "Band + DJ + Sound Engineer + Lighting. Complete show from sound check to last song.",
                instruments: ["🎸", "🎧", "🎤", "💡"],
                price: "₹25,000+"
              }
            ].map((pkg) => (
              <div
                key={pkg.name}
                className={`relative p-6 transition-all duration-300 ${
                  pkg.featured
                    ? "glass-card border-gold/40 shadow-gold"
                    : "glass-card hover:border-gold/30"
                }`}
              >
                {pkg.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full border border-gold/40 bg-josho-bg px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
                      Popular
                    </span>
                  </div>
                )}
                <div className="mb-4 flex gap-2 text-2xl">
                  {pkg.instruments.map((i, idx) => <span key={idx}>{i}</span>)}
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{pkg.name}</h3>
                <p className="mb-4 text-sm leading-relaxed text-secondary">{pkg.desc}</p>
                <p className="mb-5 text-xl font-black text-gold">{pkg.price}</p>
                <Link
                  href="/discover"
                  className="block rounded-xl border border-gold/40 bg-gold/10 py-2.5 text-center text-sm font-bold text-gold transition-all hover:bg-gold/20"
                >
                  Book Package →
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/discover" className="btn-electric inline-block px-8 py-3 text-sm">
              Build a Custom Band →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: STATS ─────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { number: "500+", label: "Verified Artists" },
              { number: "1,200+", label: "Events Completed" },
              { number: "4.8★", label: "Average Rating" },
              { number: "45 min", label: "Avg Response Time" }
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-6 text-center">
                <p className="mb-1 text-3xl font-black text-gradient-electric sm:text-4xl">{stat.number}</p>
                <p className="text-xs font-medium text-secondary">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 9: FOR MUSICIANS CTA ─────────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden glass-card-red rounded-3xl">
          <div className="grid gap-0 md:grid-cols-2">
            {/* Left */}
            <div className="p-8 sm:p-12">
              <div className="mb-2 inline-block rounded-full border border-electric/30 bg-electric/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-electric">
                For Musicians
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Find Your Gig
              </h2>
              <p className="mt-3 mb-8 text-secondary">
                Perform at events in Vasai-Virar. One profile, thousands of opportunities.
              </p>
              <ul className="mb-8 space-y-3">
                {[
                  "Create a free profile",
                  "Clients contact you directly",
                  "Secure payment via Razorpay",
                  "Set your own rate",
                  "List your gear too"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal/20 text-teal text-xs">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/join" className="btn-electric inline-block px-8 py-3 text-sm">
                Join for Free
              </Link>
            </div>

            {/* Right — Mock Earnings Card */}
            <div className="flex items-center justify-center border-t border-white/[0.06] p-8 md:border-l md:border-t-0">
              <div className="w-full max-w-xs glass-card-red p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary">This Month</span>
                  <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-bold text-teal">↑ 23%</span>
                </div>
                <p className="mb-1 text-3xl font-black text-gradient-electric">₹8,400</p>
                <p className="mb-6 text-sm text-secondary">Earned from 3 gigs</p>
                <div className="space-y-3">
                  {[
                    { event: "Wedding Reception", venue: "Vasai", amount: "₹3,500", status: "Paid" },
                    { event: "Birthday Party", venue: "Virar", amount: "₹2,800", status: "Paid" },
                    { event: "Corporate Event", venue: "Nalasopara", amount: "₹2,100", status: "Paid" }
                  ].map((gig) => (
                    <div key={gig.event} className="flex items-center justify-between rounded-lg bg-white/5 p-3 border border-white/5">
                      <div>
                        <p className="text-xs font-medium text-white">{gig.event}</p>
                        <p className="text-[10px] text-muted">{gig.venue}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gold">{gig.amount}</p>
                        <p className="text-[10px] text-teal">{gig.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="mb-3 flex items-center gap-2">
                <span>🎵</span>
                <span className="font-bold">
                  <span className="text-gradient-electric">Sohaya</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted">
                Mumbai&apos;s best music marketplace. Starting from Vasai-Virar, covering the entire city.
              </p>
            </div>
            {/* For Clients */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-secondary">For Clients</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><Link href="/discover" className="hover:text-white">Find Artists</Link></li>
                <li><Link href="/tonight" className="hover:text-white">Tonight Available</Link></li>
                <li><Link href="/gear" className="hover:text-white">Gear Rental</Link></li>
                <li><Link href="/discover" className="hover:text-white">Wedding Bands</Link></li>
              </ul>
            </div>
            {/* For Artists */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-secondary">For Artists</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><Link href="/join" className="hover:text-white">Join Free</Link></li>
                <li><Link href="/login" className="hover:text-white">Artist Login</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/gear" className="hover:text-white">List Your Gear</Link></li>
              </ul>
            </div>
            {/* Company */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-secondary">Company</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><span className="hover:text-white">About Sohaya</span></li>
                <li><span className="hover:text-white">Contact Us</span></li>
                <li><span className="hover:text-white">Privacy Policy</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-white/[0.06] pt-6 text-center text-xs text-muted">
            © 2026 Sohaya. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}

const MOCK_TRENDING = [
  { id: "1", name: "Priya Fernandes", genre: "Bollywood", rating: "4.9", emoji: "🎤" },
  { id: "2", name: "DJ Rahul V.", genre: "EDM · Wedding", rating: "4.8", emoji: "🎧" },
  { id: "3", name: "The Brass Boys", genre: "Brass Band", rating: "4.7", emoji: "🎺" },
  { id: "4", name: "Suresh Tabla", genre: "Classical · Sufi", rating: "5.0", emoji: "🥁" },
  { id: "5", name: "Akash Guitar", genre: "Western · Rock", rating: "4.8", emoji: "🎸" },
  { id: "6", name: "Maria Violins", genre: "Classical · Gospel", rating: "4.9", emoji: "🎻" },
  { id: "7", name: "Kevin D'souza", genre: "Vasaikar Folk", rating: "4.7", emoji: "🎵" },
  { id: "8", name: "Zainab Vocals", genre: "Sufi · Ghazal", rating: "4.9", emoji: "🎤" }
];
