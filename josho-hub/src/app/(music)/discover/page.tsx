import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DiscoverClient } from "./discover-client";

const GENRES = [
  { slug: "all", name: "All" },
  { slug: "vasaikar", name: "Vasaikar" },
  { slug: "bollywood", name: "Bollywood" },
  { slug: "sufi", name: "Sufi" },
  { slug: "western", name: "Western" },
  { slug: "classical", name: "Classical" },
  { slug: "gospel", name: "Gospel" },
  { slug: "marathi", name: "Marathi" }
];

async function getArtists(filterDate?: string) {
  const supabase = createServerSupabaseClient();

  // Query artist_profiles table directly
  const { data: artists, error } = await supabase
    .from("artist_profiles")
    .select("id, user_id, stage_name, bio, event_rate, city, profile_photo, avg_rating, total_bookings, featured, available, verification_status")
    .eq("available", true)
    .eq("verification_status", "verified")
    .order("featured", { ascending: false })
    .order("search_rank", { ascending: false })
    .limit(60);

  if (error) {
    console.error("[Discover] Error fetching artists:", error.message);
  }

  // Query instruments separately
  const { data: instrumentRows } = await supabase
    .from("artist_instruments")
    .select("artist_id, instruments ( slug, name )");

  // Build instruments lookup by artist_id
  const instrumentsByArtist = new Map<string, string[]>();
  (instrumentRows ?? []).forEach((row) => {
    const r = row as unknown as { artist_id: string; instruments: { name: string } | null };
    if (!r.instruments) return;
    const list = instrumentsByArtist.get(r.artist_id) ?? [];
    list.push(r.instruments.name);
    instrumentsByArtist.set(r.artist_id, list);
  });

  // Query genres separately
  const { data: genreRows } = await supabase
    .from("artist_genres")
    .select("artist_id, genres ( slug, name )");

  const genresByArtist = new Map<string, { slug: string; name: string }[]>();
  (genreRows ?? []).forEach((row) => {
    const r = row as unknown as { artist_id: string; genres: { slug: string; name: string } | null };
    if (!r.genres) return;
    const list = genresByArtist.get(r.artist_id) ?? [];
    list.push(r.genres);
    genresByArtist.set(r.artist_id, list);
  });

  let result = (artists ?? []) as Array<Record<string, unknown>>;

  // Filter out artists with conflicting bookings on the given date
  if (filterDate) {
    const dayStart = `${filterDate}T00:00:00`;
    const dayEnd = `${filterDate}T23:59:59`;
    const { data: booked } = await supabase
      .from("event_bookings")
      .select("artist_id")
      .in("status", ["requested", "accepted", "confirmed"])
      .gte("event_date", dayStart)
      .lte("event_date", dayEnd);
    const bookedIds = new Set((booked ?? []).map((b) => (b as { artist_id: string }).artist_id));
    result = result.filter((a) => !bookedIds.has(a.id as string));
  }

  return result.map((a: Record<string, unknown>) => {
    const artistGenres = genresByArtist.get(a.id as string) ?? [];
    return {
      id: a.id as string,
      stageName: a.stage_name as string,
      bio: a.bio as string | null,
      eventRate: a.event_rate as number | null,
      city: a.city as string,
      profilePhoto: a.profile_photo as string | null,
      avgRating: (a.avg_rating as number) || 4.5,
      totalBookings: (a.total_bookings as number) || 0,
      featured: a.featured as boolean,
      available: a.available as boolean,
      genres: artistGenres.map(g => g.name),
      genreSlugs: artistGenres.map(g => g.slug),
      instruments: instrumentsByArtist.get(a.id as string) ?? []
    };
  });
}

export default async function DiscoverPage({
  searchParams
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams?.date;
  const artists = await getArtists(date);

  return <DiscoverClient artists={artists} genres={GENRES} />;
}
