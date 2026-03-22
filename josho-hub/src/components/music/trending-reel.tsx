"use client";

import { useRef, useState } from "react";
import Link from "next/link";

interface TrendingArtist {
  id: string;
  stageName: string;
  profilePhoto?: string | null;
  genres: string[];
  avgRating: number;
  city?: string;
  trending_score?: number;
}

interface TrendingReelProps {
  artists: TrendingArtist[];
  title?: string;
  showAiBadge?: boolean;
}

export function TrendingReel({
  artists,
  title = "🔥 Trending in Vasai-Virar",
  showAiBadge = true
}: TrendingReelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth"
    });
  }

  function handleScroll() {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 10);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
  }

  if (artists.length === 0) return null;

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <h2 className="text-xl font-black text-[#eeeef8] sm:text-2xl">{title}</h2>
        {showAiBadge && (
          <span className="rounded-full border border-teal/30 bg-teal/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal">
            AI Powered
          </span>
        )}
      </div>

      {/* Scroll container */}
      <div className="relative overflow-hidden">
        {/* Left Arrow */}
        {showLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-josho-surface/90 text-[#eeeef8] shadow-lg backdrop-blur-sm transition-all hover:bg-josho-elevated"
          >
            ←
          </button>
        )}

        {/* Right Arrow */}
        {showRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-josho-surface/90 text-[#eeeef8] shadow-lg backdrop-blur-sm transition-all hover:bg-josho-elevated"
          >
            →
          </button>
        )}

        {/* Left fade */}
        {showLeft && (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-12 bg-gradient-to-r from-josho-bg to-transparent" />
        )}

        {/* Right fade (scroll hint) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-16 bg-gradient-to-l from-josho-bg to-transparent" />

        {/* Artist Cards Row */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="scrollbar-hide flex gap-3 overflow-x-auto pb-2"
        >
          {artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artists/${artist.id}`}
              className="group relative flex-shrink-0 w-40 sm:w-44"
            >
              {/* Card */}
              <div className="overflow-hidden rounded-2xl border border-josho-border bg-josho-surface transition-all duration-300 hover:border-gold/40 hover:shadow-[0_8px_30px_rgba(245,166,35,0.12)]">
                {/* Photo — 2:3 ratio */}
                <div className="relative aspect-[2/3] overflow-hidden bg-josho-elevated">
                  {artist.profilePhoto ? (
                    <img
                      src={artist.profilePhoto}
                      alt={artist.stageName}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl text-josho-glow">
                      {artist.stageName.charAt(0)}
                    </div>
                  )}

                  {/* Bottom gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-josho-bg to-transparent" />

                  {/* Artist info at bottom */}
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="truncate text-sm font-bold text-[#eeeef8]">{artist.stageName}</p>
                    {artist.genres.length > 0 && (
                      <p className="mt-0.5 truncate text-[10px] text-gold">{artist.genres[0]}</p>
                    )}
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-[10px] text-gold">★</span>
                      <span className="text-[10px] text-[#9090b0]">{artist.avgRating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Book button on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-josho-bg/40">
                    <span className="rounded-xl bg-gradient-to-r from-gold to-amber-400 px-4 py-1.5 text-xs font-bold text-josho-bg shadow-gold">
                      Book
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
