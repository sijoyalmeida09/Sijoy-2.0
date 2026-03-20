"use client";

import Link from "next/link";
import { useState } from "react";

interface ArtistCardProps {
  id: string;
  stageName: string;
  profilePhoto: string | null;
  genres: string[];
  instruments: string[];
  avgRating: number;
  totalBookings: number;
  eventRate: number | null;
  featured: boolean;
  available: boolean;
  bio?: string | null;
  city?: string;
  availableTonight?: boolean;
  showBookButton?: boolean;
  /** If provided, opens modal on click instead of navigating */
  onPreview?: (id: string) => void;
}

export function ArtistCard({
  id,
  stageName,
  profilePhoto,
  genres,
  instruments,
  avgRating,
  totalBookings,
  eventRate,
  featured,
  available,
  bio,
  city,
  availableTonight,
  showBookButton = true,
  onPreview
}: ArtistCardProps) {
  const [hearted, setHearted] = useState(false);

  const cardContent = (
    <div className="group relative flex flex-col overflow-hidden glass-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_12px_40px_rgba(245,166,35,0.18)]">
      {/* Photo Area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-josho-elevated">
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt={stageName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl text-electric/40">
            {stageName.charAt(0)}
          </div>
        )}

        {/* Dark gradient overlay from bottom */}
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-josho-bg via-josho-bg/40 to-transparent" />

        {/* Top badges — left */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {featured && (
            <span className="rounded-full bg-gold/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-josho-bg">
              Featured
            </span>
          )}
          {genres.slice(0, 1).map((g) => (
            <span key={g} className="rounded-full bg-josho-bg/70 px-2 py-0.5 text-[10px] font-medium text-secondary backdrop-blur-sm">
              {g}
            </span>
          ))}
        </div>

        {/* Top right — heart */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setHearted(!hearted); }}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-josho-bg/60 text-sm backdrop-blur-sm transition-transform hover:scale-110"
        >
          {hearted ? "❤️" : "🤍"}
        </button>

        {/* Bottom overlay badges */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1">
          {availableTonight && (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal/20 px-2 py-0.5 text-[10px] font-bold text-teal backdrop-blur-sm border border-teal/30">
              <span className="h-1.5 w-1.5 rounded-full bg-teal" />
              Available Tonight
            </span>
          )}
          {totalBookings >= 10 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-electric/20 px-2 py-0.5 text-[10px] font-bold text-electric backdrop-blur-sm border border-electric/30">
              ⭐ Top Performer
            </span>
          )}
        </div>

        {/* Unavailable overlay */}
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-secondary">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-4">
        {/* Name + Location */}
        <div className="mb-2">
          <h3 className="font-bold text-white leading-tight">{stageName}</h3>
          {city && <p className="mt-0.5 text-xs text-muted">{city}</p>}
        </div>

        {/* Instruments */}
        <div className="mb-3 flex flex-wrap gap-1">
          {instruments.slice(0, 3).map((i) => (
            <span key={i} className="rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[10px] text-secondary border border-white/5">
              {i}
            </span>
          ))}
          {instruments.length > 3 && (
            <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-muted border border-white/5">
              +{instruments.length - 3}
            </span>
          )}
        </div>

        {/* Rating + Bookings */}
        <div className="mb-3 flex items-center gap-3 text-xs text-secondary">
          <span className="flex items-center gap-1">
            <span className="text-gold">★</span>
            <span className="font-medium text-white">{avgRating.toFixed(1)}</span>
          </span>
          <span className="text-muted">·</span>
          <span>{totalBookings} bookings</span>
          {eventRate && (
            <>
              <span className="text-muted">·</span>
              <span className="font-medium text-white">₹{eventRate.toLocaleString("en-IN")}</span>
            </>
          )}
        </div>

        {/* Bio snippet */}
        {bio && (
          <p className="mb-3 line-clamp-1 text-xs text-muted">{bio}</p>
        )}

        {/* Buttons */}
        {showBookButton && (
          <div className="mt-auto flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-medium text-secondary transition-all hover:border-electric/40 hover:text-white"
              onClick={(e) => {
                e.preventDefault();
                if (onPreview) onPreview(id);
              }}
            >
              View Profile
            </button>
            <Link
              href={`/book?artist=${id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 rounded-xl bg-gradient-to-r from-gold to-amber-400 py-2 text-center text-xs font-bold text-josho-bg transition-all hover:shadow-gold"
            >
              Quick Book
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  if (onPreview && !showBookButton) {
    return (
      <button
        type="button"
        onClick={() => onPreview(id)}
        className="block w-full text-left"
      >
        {cardContent}
      </button>
    );
  }

  if (!showBookButton) {
    return <Link href={`/artists/${id}`}>{cardContent}</Link>;
  }

  return <div>{cardContent}</div>;
}
