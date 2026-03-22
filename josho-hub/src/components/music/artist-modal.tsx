"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RatingStars } from "@/components/music/rating-stars";
import { MediaCarousel } from "@/components/music/media-carousel";

interface ArtistModalProps {
  artistId: string | null;
  onClose: () => void;
}

interface ArtistData {
  artist: {
    id: string;
    stage_name: string;
    bio: string | null;
    event_rate: number | null;
    city: string;
    region: string;
    profile_photo: string | null;
    cover_photo: string | null;
    avg_rating: number;
    total_bookings: number;
    featured: boolean;
    artist_genres?: Array<{ genres: { slug: string; name: string } }>;
    artist_instruments?: Array<{ instruments: { slug: string; name: string } }>;
  };
  media: Array<{
    id: string;
    media_type: "image" | "video" | "audio" | "youtube";
    url: string;
    thumbnail: string | null;
    title: string | null;
    sort_order: number;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    profiles?: { full_name: string | null };
  }>;
  recommendations: Array<{
    recommended_id: string;
    reason: string | null;
    artist_profiles?: {
      id: string;
      stage_name: string;
      profile_photo: string | null;
      event_rate: number | null;
      artist_instruments?: Array<{ instruments: { name: string } }>;
    };
  }>;
}

export function ArtistModal({ artistId, onClose }: ArtistModalProps) {
  const [data, setData] = useState<ArtistData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artistId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/artists/${artistId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Artist not found");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [artistId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!artistId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="artist-modal-title"
    >
      {/* Backdrop — glassmorphism */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel — glassmorphism */}
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0d1a30]/95 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-joshoBlue border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-red-400">
            <p>{error}</p>
            <button
              onClick={onClose}
              className="mt-4 rounded-lg bg-blue-900/50 px-4 py-2 text-sm text-white"
            >
              Close
            </button>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Header */}
            <div className="relative border-b border-white/10 p-6">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#13213d]">
                  {data.artist.profile_photo ? (
                    <img
                      src={data.artist.profile_photo}
                      alt={data.artist.stage_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl text-blue-600">
                      {data.artist.stage_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 id="artist-modal-title" className="text-xl font-bold text-white">
                    {data.artist.stage_name}
                  </h2>
                  <p className="text-sm text-blue-200">
                    {data.artist.city}, {data.artist.region}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <RatingStars rating={data.artist.avg_rating} size="sm" />
                    <span className="text-blue-300">
                      {data.artist.avg_rating.toFixed(1)} ({data.artist.total_bookings} gigs)
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(data.artist.artist_genres ?? []).map((g) => (
                      <span
                        key={g.genres.slug}
                        className="rounded-full bg-joshoBlue/20 px-2 py-0.5 text-xs text-blue-200"
                      >
                        {g.genres.name}
                      </span>
                    ))}
                  </div>
                  {data.artist.event_rate && (
                    <p className="mt-2 text-lg font-bold text-white">
                      &#8377;{data.artist.event_rate.toLocaleString("en-IN")}{" "}
                      <span className="text-sm font-normal text-blue-300">per event</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 p-6">
              {data.artist.bio && (
                <div>
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-300">About</h3>
                  <p className="text-sm text-blue-100 line-clamp-3">{data.artist.bio}</p>
                </div>
              )}

              {data.media.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-300">Media</h3>
                  <MediaCarousel items={data.media} />
                </div>
              )}

              {data.reviews.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-300">
                    Reviews ({data.reviews.length})
                  </h3>
                  <div className="space-y-2">
                    {data.reviews.slice(0, 3).map((r) => (
                      <div
                        key={r.id}
                        className="rounded-lg border border-blue-900/20 bg-[#13213d]/50 p-2"
                      >
                        <div className="flex items-center gap-2">
                          <RatingStars rating={r.rating} size="sm" />
                          <span className="text-xs text-blue-400">
                            {(r.profiles as { full_name?: string })?.full_name ?? "Anonymous"}
                          </span>
                        </div>
                        {r.comment && (
                          <p className="mt-1 line-clamp-2 text-xs text-blue-100">{r.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t border-white/10 p-6">
              <Link
                href={`/artists/${data.artist.id}`}
                className="flex-1 rounded-full bg-joshoBlue py-2.5 text-center text-sm font-bold text-white hover:opacity-90"
              >
                View Full Profile
              </Link>
              <Link
                href={`/book?artist=${data.artist.id}`}
                className="flex-1 rounded-full border border-joshoBlue bg-transparent py-2.5 text-center text-sm font-bold text-joshoBlue hover:bg-joshoBlue/10"
              >
                Book Now
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
