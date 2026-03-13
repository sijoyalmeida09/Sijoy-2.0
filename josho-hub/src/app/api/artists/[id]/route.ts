import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  if (!id) return NextResponse.json({ error: "Missing artist id" }, { status: 400 });

  const supabase = createServerSupabaseClient();

  const { data: artist, error: artistErr } = await supabase
    .from("artist_profiles")
    .select(`
      id, user_id, stage_name, bio, event_rate, hourly_rate, city, region,
      profile_photo, cover_photo, youtube_url, instagram_url,
      avg_rating, total_bookings, featured, verification_status,
      artist_genres ( genres ( slug, name ) ),
      artist_instruments ( instruments ( slug, name ) )
    `)
    .eq("id", id)
    .maybeSingle();

  if (artistErr || !artist) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }

  const [mediaRes, reviewsRes, recsRes] = await Promise.all([
    supabase
      .from("artist_media")
      .select("id, media_type, url, thumbnail, title, sort_order")
      .eq("artist_id", id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("booking_reviews")
      .select("id, rating, comment, created_at, profiles!booking_reviews_reviewer_id_fkey ( full_name )")
      .eq("reviewee_id", artist.user_id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("artist_recommendations")
      .select("recommended_id, reason, score, artist_profiles!artist_recommendations_recommended_id_fkey ( id, stage_name, profile_photo, event_rate, artist_instruments ( instruments ( name ) ) )")
      .eq("source_artist", id)
      .order("score", { ascending: false })
      .limit(4)
  ]);

  return NextResponse.json({
    artist,
    media: mediaRes.data ?? [],
    reviews: reviewsRes.data ?? [],
    recommendations: recsRes.data ?? []
  });
}
