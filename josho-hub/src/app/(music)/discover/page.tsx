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

  let query = supabase
    .from("artist_profiles")
    .select(`
      id, stage_name, bio, event_rate, city, profile_photo,
      avg_rating, total_bookings, featured, available,
      artist_genres ( genre_id, genres ( slug, name ) ),
      artist_instruments ( instrument_id, instruments ( slug, name ) )
    `)
    .eq("available", true)
    .eq("verification_status", "verified")
    .order("featured", { ascending: false })
    .order("search_rank", { ascending: false })
    .limit(60);

  const { data: artists } = await query;

  let result = (artists ?? []) as Array<Record<string, unknown>>;

  if (filterDate) {
    const dayStart = `${filterDate}T00:00:00`;
    const dayEnd = `${filterDate}T23:59:59`;
    const { data: booked } = await supabase
      .from("event_bookings")
      .select("artist_id")
      .in("status", ["requested", "accepted", "confirmed", "completed"])
      .gte("event_date", dayStart)
      .lte("event_date", dayEnd);
    const bookedIds = new Set((booked ?? []).map((b) => b.artist_id));
    result = result.filter((a) => !bookedIds.has(a.id));
  }

  return result.map((a: Record<string, unknown>) => ({
    id: a.id as string,
    stageName: a.stage_name as string,
    bio: a.bio as string | null,
    eventRate: a.event_rate as number | null,
    city: a.city as string,
    profilePhoto: a.profile_photo as string | null,
    avgRating: a.avg_rating as number,
    totalBookings: a.total_bookings as number,
    featured: a.featured as boolean,
    available: a.available as boolean,
    genres: ((a.artist_genres as Array<{ genres: { slug: string; name: string } }>) ?? []).map((g) => g.genres.name),
    genreSlugs: ((a.artist_genres as Array<{ genres: { slug: string; name: string } }>) ?? []).map((g) => g.genres.slug),
    instruments: ((a.artist_instruments as Array<{ instruments: { slug: string; name: string } }>) ?? []).map(
      (i) => i.instruments.name
    )
  }));
}

export default async function DiscoverPage({
  searchParams
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams?.date;
  const artists = await getArtists(date);

  return <DiscoverClient artists={artists} genres={GENRES} initialDate={date} />;
}
