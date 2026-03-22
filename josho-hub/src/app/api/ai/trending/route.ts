import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "Vasai-Virar";
  const genre = searchParams.get("genre") || null;
  const limit = parseInt(searchParams.get("limit") || "12");

  // Score = (total_bookings * 0.4) + (avg_rating * 20 * 0.3) + (featured ? 30 : 0) + (recent_activity * 0.3)
  let query = supabase
    .from("artist_profiles")
    .select(`
      id, stage_name, bio, event_rate, city, profile_photo,
      avg_rating, total_bookings, featured, available, verification_status,
      artist_genres ( genres ( name, slug ) ),
      artist_instruments ( instruments ( name, slug ) )
    `)
    .eq("verification_status", "verified")
    .eq("available", true)
    .order("total_bookings", { ascending: false })
    .order("avg_rating", { ascending: false })
    .limit(limit * 2); // fetch more for filtering

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let artists = (data || []) as Array<Record<string, unknown>>;

  // Filter by genre if provided
  if (genre && genre !== "all") {
    artists = artists.filter((a) => {
      const genreRows = (a.artist_genres as Array<Record<string, unknown>>) || [];
      return genreRows.some((gr) => {
        const g = gr.genres as Record<string, unknown> | null;
        return g?.slug === genre || g?.name?.toString().toLowerCase() === genre.toLowerCase();
      });
    });
  }

  // Add trending score and limit
  const scored = artists
    .map((a) => {
      const totalBookings = (a.total_bookings as number) || 0;
      const avgRating = (a.avg_rating as number) || 0;
      const featured = (a.featured as boolean) || false;

      const trending_score =
        totalBookings * 0.4 +
        avgRating * 20 * 0.3 +
        (featured ? 30 : 0);

      // Flatten genres and instruments
      const genres = ((a.artist_genres as Array<Record<string, unknown>>) || [])
        .map((gr) => (gr.genres as Record<string, unknown>)?.name as string)
        .filter(Boolean);

      const instruments = ((a.artist_instruments as Array<Record<string, unknown>>) || [])
        .map((ir) => (ir.instruments as Record<string, unknown>)?.name as string)
        .filter(Boolean);

      return {
        id: a.id,
        stageName: a.stage_name,
        bio: a.bio,
        eventRate: a.event_rate,
        city: a.city,
        profilePhoto: a.profile_photo,
        avgRating,
        totalBookings,
        featured,
        available: a.available,
        genres,
        instruments,
        trending_score
      };
    })
    .sort((a, b) => b.trending_score - a.trending_score)
    .slice(0, limit);

  return NextResponse.json({
    artists: scored,
    city,
    genre: genre || null,
    count: scored.length,
    generated_at: new Date().toISOString()
  });
}
