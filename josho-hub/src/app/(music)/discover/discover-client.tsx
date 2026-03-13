"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArtistCard } from "@/components/music/artist-card";
import { GenrePill } from "@/components/music/genre-pill";
import { BudgetSlider } from "@/components/music/budget-slider";
import { ArtistModal } from "@/components/music/artist-modal";

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

export function DiscoverClient({ artists, genres, initialDate }: DiscoverClientProps) {
  const [activeGenre, setActiveGenre] = useState("all");
  const [budget, setBudget] = useState(50000);
  const [search, setSearch] = useState("");
  const [previewArtistId, setPreviewArtistId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState(initialDate ?? "");
  useEffect(() => setDateFilter(initialDate ?? ""), [initialDate]);
  const router = useRouter();
  const pathname = usePathname();

  function applyDateFilter(date: string) {
    setDateFilter(date);
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    router.push(params.toString() ? `${pathname}?${params}` : pathname);
  }

  const filtered = useMemo(() => {
    return artists.filter((a) => {
      if (activeGenre !== "all" && !a.genreSlugs.includes(activeGenre)) return false;
      if (a.eventRate && a.eventRate > budget) return false;
      if (search && !a.stageName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [artists, activeGenre, budget, search]);

  const featuredArtists = filtered.filter((a) => a.featured);
  const regularArtists = filtered.filter((a) => !a.featured);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      {previewArtistId && (
        <ArtistModal
          artistId={previewArtistId}
          onClose={() => setPreviewArtistId(null)}
        />
      )}
      {/* Hero */}
      <section className="mb-8 rounded-2xl border border-blue-900/30 bg-gradient-to-br from-[#0d1a30] to-[#162746] p-6 sm:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-joshoBlue">Vasai-Virar&apos;s Music Marketplace</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-5xl">
          Book the sound<br />your event deserves.
        </h1>
        <p className="mt-3 max-w-lg text-blue-200">
          Browse artists. Build your dream band. Pay securely. We only earn when the event is a success.
        </p>
      </section>

      {/* Filters */}
      <section className="mb-6 space-y-4 rounded-xl border border-blue-900/30 bg-[#13213d] p-4">
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <GenrePill
              key={g.slug}
              slug={g.slug}
              name={g.name}
              active={activeGenre === g.slug}
              onClick={setActiveGenre}
            />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            placeholder="Search by artist name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-blue-800/40 bg-[#0d1a30] px-3 py-2 text-sm text-white outline-none ring-joshoBlue placeholder:text-blue-600 focus:ring-2"
          />
          <div>
            <label className="mb-1 block text-xs font-medium text-blue-200">Event date (filter availability)</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => applyDateFilter(e.target.value)}
              className="w-full rounded-lg border border-blue-800/40 bg-[#0d1a30] px-3 py-2 text-sm text-white outline-none ring-joshoBlue focus:ring-2"
            />
          </div>
          <BudgetSlider min={2000} max={100000} value={budget} onChange={setBudget} label="Max budget per artist" />
        </div>
      </section>

      {/* Featured row */}
      {featuredArtists.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400">Featured Artists</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {featuredArtists.map((a) => (
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
                onPreview={setPreviewArtistId}
              />
            ))}
          </div>
        </section>
      )}

      {/* All artists grid */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-300">
          All Artists ({filtered.length})
        </h2>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-blue-900/30 bg-[#13213d] p-10 text-center">
            <p className="text-blue-300">No artists match your filters. Try adjusting genre or budget.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {regularArtists.map((a) => (
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
                onPreview={setPreviewArtistId}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
