"use client";

import { useState } from "react";
import Link from "next/link";

interface BandMember {
  artistId: string;
  stageName: string;
  instrument: string;
  eventRate: number;
  profilePhoto: string | null;
}

interface BandBuilderProps {
  recommendations?: BandMember[];
  budget?: number;
  onSelectionChange?: (selected: BandMember[]) => void;
}

const UPSELL_PACKAGES = [
  {
    id: "acoustic-duo",
    name: "Acoustic Evening",
    instruments: ["🎤 Singer", "🎸 Guitarist"],
    desc: "Intimate vibes for small gatherings, house parties, rooftop dinners. Unplugged magic.",
    priceRange: "₹5,000 – 10,000",
    color: "electric" as const
  },
  {
    id: "sufi-night",
    name: "Sufi Night",
    instruments: ["🎤 Vocalist", "🥁 Tabla", "🎹 Harmonium", "🎺 Flute"],
    desc: "Soulful Sufi atmosphere. Perfect for intimate events, mehndis, and spiritual gatherings.",
    priceRange: "₹8,000 – 15,000",
    color: "gold" as const,
    popular: true
  },
  {
    id: "bollywood-party",
    name: "Bollywood Party",
    instruments: ["🎤 Singer", "🎹 Keyboard", "🥁 Drums", "🎧 DJ"],
    desc: "The dance floor will definitely be packed. Full Bollywood vibe with live instruments + DJ.",
    priceRange: "₹15,000 – 30,000",
    color: "crimson" as const
  },
  {
    id: "brass-wedding",
    name: "Brass Wedding",
    instruments: ["🎺 Trumpet", "🎷 Sax", "🪘 Dhol", "🎤 Singer"],
    desc: "Traditional baraat energy with modern brass arrangements. Unforgettable entry.",
    priceRange: "₹12,000 – 25,000",
    color: "teal" as const
  },
  {
    id: "full-event",
    name: "Full Event Show",
    instruments: ["🎸 Band", "🎧 DJ", "🎛️ Sound Engineer", "💡 Lighting"],
    desc: "Complete production. From soundcheck to last dance — we handle everything.",
    priceRange: "₹30,000+",
    color: "electric" as const
  }
];

const COLOR_MAP = {
  electric: {
    border: "border-electric/30",
    bg: "bg-electric/8",
    badge: "bg-electric/15 text-electric border-electric/30",
    button: "border-electric/40 bg-electric/10 text-electric hover:bg-electric/20",
    popular: "bg-electric/20 text-electric border-electric/40"
  },
  gold: {
    border: "border-gold/30",
    bg: "bg-gold/5",
    badge: "bg-gold/15 text-gold border-gold/30",
    button: "border-gold/40 bg-gold/10 text-gold hover:bg-gold/20",
    popular: "bg-gold/20 text-gold border-gold/40"
  },
  crimson: {
    border: "border-crimson/30",
    bg: "bg-crimson/5",
    badge: "bg-crimson/15 text-crimson border-crimson/30",
    button: "border-crimson/40 bg-crimson/10 text-crimson hover:bg-crimson/20",
    popular: "bg-crimson/20 text-crimson border-crimson/40"
  },
  teal: {
    border: "border-teal/30",
    bg: "bg-teal/5",
    badge: "bg-teal/15 text-teal border-teal/30",
    button: "border-teal/40 bg-teal/10 text-teal hover:bg-teal/20",
    popular: "bg-teal/20 text-teal border-teal/40"
  }
};

export function BandBuilder({ recommendations = [], budget = 50000, onSelectionChange }: BandBuilderProps) {
  const [selected, setSelected] = useState<BandMember[]>([]);
  const [activePackage, setActivePackage] = useState<string | null>(null);

  const totalCost = selected.reduce((sum, m) => sum + m.eventRate, 0);
  const overBudget = budget > 0 && totalCost > budget;

  function toggle(member: BandMember) {
    const exists = selected.find((s) => s.artistId === member.artistId);
    const next = exists
      ? selected.filter((s) => s.artistId !== member.artistId)
      : [...selected, member];
    setSelected(next);
    onSelectionChange?.(next);
  }

  return (
    <div className="space-y-8">
      {/* Package Cards */}
      <div>
        <div className="mb-6 text-center">
          <h3 className="text-xl font-black text-[#eeeef8]">Build Your Perfect Band</h3>
          <p className="mt-1 text-sm text-[#9090b0]">
            Ready-made packages — tap and book
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {UPSELL_PACKAGES.map((pkg) => {
            const colors = COLOR_MAP[pkg.color];
            return (
              <div
                key={pkg.id}
                className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${colors.border} ${colors.bg} hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]`}
                onClick={() => setActivePackage(activePackage === pkg.id ? null : pkg.id)}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide ${colors.popular}`}>
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Instruments row */}
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {pkg.instruments.map((inst) => (
                    <span
                      key={inst}
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${colors.badge}`}
                    >
                      {inst}
                    </span>
                  ))}
                </div>

                <h4 className="mb-1.5 font-bold text-[#eeeef8]">{pkg.name}</h4>
                <p className="mb-3 text-xs leading-relaxed text-[#9090b0]">{pkg.desc}</p>
                <p className="mb-4 text-lg font-black text-[#eeeef8]">{pkg.priceRange}</p>

                <Link
                  href={`/discover?package=${pkg.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className={`block rounded-xl border py-2 text-center text-xs font-bold transition-all ${colors.button}`}
                >
                  Book Package →
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Band Builder (if recommendations provided) */}
      {recommendations.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-[#eeeef8]">Build a Custom Band</h3>
            {budget > 0 && (
              <div className={`text-sm font-bold ${overBudget ? "text-crimson" : "text-teal"}`}>
                ₹{totalCost.toLocaleString("en-IN")} / ₹{budget.toLocaleString("en-IN")}
              </div>
            )}
          </div>

          {/* Stage visualization */}
          {selected.length > 0 && (
            <div className="mb-4 rounded-2xl border border-josho-border bg-josho-surface p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#505070]">
                On Stage
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.map((m) => (
                  <div
                    key={m.artistId}
                    className="flex items-center gap-2 rounded-xl border border-josho-glow/50 bg-josho-elevated px-3 py-2"
                  >
                    <div className="h-6 w-6 overflow-hidden rounded-full bg-electric/20 text-xs flex items-center justify-center text-electric">
                      {m.stageName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#eeeef8]">{m.stageName}</p>
                      <p className="text-[10px] text-[#9090b0]">{m.instrument}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggle(m)}
                      className="ml-1 text-[#505070] hover:text-crimson text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {overBudget && (
                <p className="mt-2 text-xs text-crimson">
                  ₹{(totalCost - budget).toLocaleString("en-IN")} over budget.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {recommendations.map((member) => {
              const isSelected = selected.some((s) => s.artistId === member.artistId);
              return (
                <button
                  key={member.artistId}
                  type="button"
                  onClick={() => toggle(member)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all ${
                    isSelected
                      ? "border-electric/60 bg-electric/10 shadow-electric"
                      : "border-josho-border bg-josho-surface hover:border-josho-glow"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-josho-elevated">
                    {member.profilePhoto ? (
                      <img src={member.profilePhoto} alt={member.stageName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xl text-electric">{member.stageName.charAt(0)}</span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-[#eeeef8]">{member.stageName}</p>
                  <p className="text-[10px] uppercase tracking-wide text-[#9090b0]">{member.instrument}</p>
                  <p className="text-xs font-semibold text-[#eeeef8]">₹{member.eventRate.toLocaleString("en-IN")}</p>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-electric">ADDED ✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
