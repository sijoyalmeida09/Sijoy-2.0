"use client";

import Link from "next/link";
import { useState } from "react";
import { GearCard } from "@/components/music/gear-card";

const GEAR_CATEGORIES = [
  {
    icon: "🔊",
    name: "PA System / Sound Setup",
    desc: "Powered speakers, mixer, cables included",
    priceRange: "₹1,500 – 5,000 / day",
    available: 8,
    color: "electric"
  },
  {
    icon: "💡",
    name: "Stage Lighting",
    desc: "LED par cans, moving heads, fog machine",
    priceRange: "₹2,000 – 8,000 / day",
    available: 5,
    color: "gold"
  },
  {
    icon: "🎹",
    name: "Keyboard / Piano",
    desc: "Yamaha, Roland, Casio — weighted keys",
    priceRange: "₹500 – 1,500 / day",
    available: 12,
    color: "teal"
  },
  {
    icon: "🥁",
    name: "Full Drum Kit",
    desc: "5-piece acoustic, with cymbals and hardware",
    priceRange: "₹800 – 2,000 / day",
    available: 6,
    color: "crimson"
  },
  {
    icon: "🎸",
    name: "Guitar + Amp",
    desc: "Acoustic, electric, bass — with amplifier",
    priceRange: "₹400 – 1,000 / day",
    available: 15,
    color: "electric"
  },
  {
    icon: "🎤",
    name: "Mic + Stand Bundle",
    desc: "SM58 type, condenser, wireless options",
    priceRange: "₹200 – 500 / day",
    available: 20,
    color: "teal"
  },
  {
    icon: "🎺",
    name: "Trumpet / Sax",
    desc: "Beginner to professional grade available",
    priceRange: "₹300 – 800 / day",
    available: 4,
    color: "gold"
  },
  {
    icon: "🪘",
    name: "Dhol / Tabla Set",
    desc: "Traditional hand-crafted sets",
    priceRange: "₹400 – 1,200 / day",
    available: 9,
    color: "crimson"
  }
];

const MOCK_LISTINGS = [
  {
    id: "g1",
    name: "Behringer Europower PA System",
    type: "Sound System" as const,
    rate_per_day: 2500,
    available: true,
    musician_name: "Ravi Sound",
    city: "Vasai",
    description: "2x 15 inch powered speakers + mixer + all cables. Perfect for a single gig."
  },
  {
    id: "g2",
    name: "Yamaha PSR-E473 Keyboard",
    type: "Instrument" as const,
    rate_per_day: 800,
    available: true,
    musician_name: "Maria Keys",
    city: "Virar",
    description: "61-key, full weighted, with sustain pedal and stand included."
  },
  {
    id: "g3",
    name: "LED Stage Lighting Kit (8 par cans)",
    type: "Lighting" as const,
    rate_per_day: 3500,
    available: true,
    musician_name: "Kevin Lighting",
    city: "Nalasopara",
    description: "8x RGBW par cans with DMX controller. Professional look guaranteed at events."
  },
  {
    id: "g4",
    name: "Pearl Export Drum Kit",
    type: "Instrument" as const,
    rate_per_day: 1500,
    available: false,
    musician_name: "Drumstics Mike",
    city: "Vasai",
    description: "5-piece set with hi-hat, crash, ride. Professional quality."
  },
  {
    id: "g5",
    name: "Shure SM58 Wireless Mic Set (x3)",
    type: "Sound System" as const,
    rate_per_day: 600,
    available: true,
    musician_name: "Priya Vocals",
    city: "Mumbai",
    description: "3 wireless mics with receiver. 50 meter range. Battery included."
  },
  {
    id: "g6",
    name: "Guitar + Fender Amp Combo",
    type: "Instrument" as const,
    rate_per_day: 700,
    available: true,
    musician_name: "Akash Guitar",
    city: "Virar",
    description: "Squier Stratocaster + Fender Frontman 25W. Perfect for any gig."
  }
];

export default function GearPage() {
  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  async function handleAiMatch() {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    // Simulate AI response
    await new Promise((r) => setTimeout(r, 1200));
    setAiResult(
      `Suggestion for "${aiQuery}": PA System (₹2,500) + 2 Wireless Mics (₹400) + LED Lighting (₹1,500) = Total ₹4,400/day. 3 listings available in Vasai-Virar today.`
    );
    setAiLoading(false);
  }

  return (
    <div className="min-h-screen bg-josho-bg">
      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-josho-border px-4 py-16 sm:px-6"
        style={{
          background: "linear-gradient(135deg, rgba(91,94,244,0.06) 0%, rgba(14,15,29,1) 60%)"
        }}
      >
        <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-electric/5 blur-3xl" />
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric/10 px-4 py-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-electric">New Feature</span>
          </div>
          <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-gradient-electric">Rent Gear,</span>
            <br />
            <span className="text-[#eeeef8]">For Today</span>
          </h1>
          <p className="mb-6 max-w-xl mx-auto text-lg text-[#9090b0]">
            Musicians on the platform rent out their equipment — for a single day.
            AI auto-matches available gear to your event.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="#listings"
              className="btn-electric px-8 py-3 text-sm"
            >
              Browse Gear
            </Link>
            <Link
              href="#list-gear"
              className="rounded-full border border-josho-glow/50 px-8 py-3 text-sm font-medium text-[#9090b0] transition-all hover:border-josho-glow hover:text-[#eeeef8]"
            >
              List Your Gear
            </Link>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-[#eeeef8] sm:text-3xl">Gear Categories</h2>
            <p className="mt-2 text-[#9090b0]">Available listings in Vasai-Virar</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {GEAR_CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                className="group cursor-pointer rounded-2xl border border-josho-border bg-josho-surface p-5 transition-all duration-300 hover:border-electric/40"
              >
                <div className="mb-3 text-3xl transition-transform duration-300 group-hover:scale-110">
                  {cat.icon}
                </div>
                <h3 className="mb-1 text-sm font-bold text-[#eeeef8]">{cat.name}</h3>
                <p className="mb-2 text-xs text-[#505070]">{cat.desc}</p>
                <p className="text-xs font-bold text-electric">{cat.priceRange}</p>
                <p className="mt-1 text-[10px] text-teal">{cat.available} available</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Match Section */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-electric/20 bg-josho-surface p-8">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <h2 className="text-xl font-black text-[#eeeef8]">AI Auto-Match</h2>
              <span className="rounded-full border border-teal/30 bg-teal/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal">
                Smart
              </span>
            </div>
            <p className="mb-6 text-sm text-[#9090b0]">
              Describe your event and AI will automatically suggest available gear.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiMatch()}
                placeholder="I need a sound setup for a wedding reception in Vasai on 29 March"
                className="flex-1 rounded-xl border border-josho-border bg-josho-elevated px-4 py-3 text-sm text-[#eeeef8] placeholder:text-[#505070] outline-none focus:border-electric/60 focus:ring-1 focus:ring-electric/20"
              />
              <button
                onClick={handleAiMatch}
                disabled={aiLoading || !aiQuery.trim()}
                className="btn-electric whitespace-nowrap px-5 py-3 text-sm disabled:opacity-50"
              >
                {aiLoading ? "Thinking..." : "AI Match"}
              </button>
            </div>
            {aiResult && (
              <div className="mt-4 rounded-xl border border-teal/20 bg-teal/5 p-4">
                <div className="flex items-start gap-2">
                  <span className="text-teal text-sm">✓</span>
                  <p className="text-sm text-[#eeeef8]">{aiResult}</p>
                </div>
                <button
                  onClick={() => setAiResult(null)}
                  className="mt-3 text-xs text-electric hover:text-[#eeeef8]"
                >
                  Clear result
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Active Listings */}
      <section id="listings" className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#eeeef8]">Available Gear</h2>
              <p className="mt-1 text-sm text-[#9090b0]">{MOCK_LISTINGS.filter(g => g.available).length} listings available today</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_LISTINGS.map((item) => (
              <GearCard
                key={item.id}
                name={item.name}
                type={item.type}
                rate_per_day={item.rate_per_day}
                available={item.available}
                musician_name={item.musician_name}
                city={item.city}
                description={item.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* For Musicians CTA */}
      <section id="list-gear" className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-josho-border bg-josho-surface">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="p-8 sm:p-10">
              <div className="mb-2 inline-block rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
                For Musicians
              </div>
              <h2 className="mt-4 text-2xl font-black text-[#eeeef8]">
                Got idle gear?<br />Rent it out!
              </h2>
              <p className="mt-3 mb-6 text-[#9090b0]">
                Rent out your PA system, keyboard, or lighting kit and earn extra income. ₹500–5,000 per day.
              </p>
              <ul className="mb-8 space-y-2.5">
                {[
                  "Free listing — no charges",
                  "Set your own rate",
                  "You decide availability",
                  "Insured transactions",
                  "Direct Razorpay payment"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[#eeeef8]">
                    <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gold/20 text-[10px] text-gold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="btn-gold inline-block px-8 py-3 text-sm">
                List Gear →
              </Link>
            </div>
            <div className="flex items-center justify-center border-t border-josho-border p-8 md:border-l md:border-t-0">
              <div className="text-center">
                <p className="text-5xl mb-4">💰</p>
                <p className="text-3xl font-black text-gradient-gold">₹500 – 5,000</p>
                <p className="mt-1 text-[#9090b0]">extra per day</p>
                <p className="mt-3 text-xs text-[#505070]">Musicians in Vasai-Virar are already earning this</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
