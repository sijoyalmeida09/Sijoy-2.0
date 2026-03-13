import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RatingStars } from "@/components/music/rating-stars";

async function getArtist(id: string) {
  const supabase = createServerSupabaseClient();

  const { data: artist } = await supabase
    .from("artist_profiles")
    .select(`
      id, user_id, stage_name, bio, event_rate, hourly_rate, city, region,
      profile_photo, cover_photo, youtube_url, instagram_url,
      avg_rating, total_bookings, featured,
      artist_genres ( genres ( slug, name ) ),
      artist_instruments ( instruments ( slug, name ) )
    `)
    .eq("id", id)
    .maybeSingle();

  return artist;
}

async function getMedia(artistId: string) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("artist_media")
    .select("id, media_type, url, thumbnail, title, sort_order")
    .eq("artist_id", artistId)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

async function getReviews(artistId: string) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("booking_reviews")
    .select("id, rating, comment, created_at, reviewer_id, profiles!booking_reviews_reviewer_id_fkey ( full_name )")
    .eq("reviewee_id", artistId)
    .order("created_at", { ascending: false })
    .limit(10);
  return data ?? [];
}

async function getRecommendations(artistId: string) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("artist_recommendations")
    .select("recommended_id, reason, score, artist_profiles!artist_recommendations_recommended_id_fkey ( id, stage_name, profile_photo, event_rate, artist_instruments ( instruments ( name ) ) )")
    .eq("source_artist", artistId)
    .order("score", { ascending: false })
    .limit(6);
  return data ?? [];
}

export default async function ArtistProfilePage({ params }: { params: { id: string } }) {
  const artist = await getArtist(params.id);
  if (!artist) notFound();

  const [media, reviews, recommendations] = await Promise.all([
    getMedia(artist.id as string),
    getReviews(artist.user_id as string),
    getRecommendations(artist.id as string)
  ]);

  const genres = ((artist.artist_genres as Array<{ genres: { name: string } }>) ?? []).map((g) => g.genres.name);
  const instruments = ((artist.artist_instruments as Array<{ instruments: { name: string } }>) ?? []).map(
    (i) => i.instruments.name
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      {/* Cover + profile header */}
      <section className="relative mb-6 overflow-hidden rounded-2xl border border-blue-900/30 bg-[#13213d]">
        <div className="h-48 bg-gradient-to-r from-joshoNavy to-joshoBlue sm:h-64">
          {(artist.cover_photo as string | null) && (
            <img src={artist.cover_photo as string} alt="" className="h-full w-full object-cover opacity-60" />
          )}
        </div>
        <div className="relative -mt-16 px-6 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="h-28 w-28 overflow-hidden rounded-xl border-4 border-[#13213d] bg-[#0d1a30] shadow-panel">
              {(artist.profile_photo as string | null) ? (
                <img src={artist.profile_photo as string} alt={artist.stage_name as string} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl text-blue-600">
                  {(artist.stage_name as string).charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{artist.stage_name as string}</h1>
              <p className="text-sm text-blue-200">{(artist.city as string)}, {(artist.region as string)}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                <RatingStars rating={artist.avg_rating as number} size="sm" />
                <span className="text-blue-300">{(artist.avg_rating as number).toFixed(1)} ({artist.total_bookings as number} gigs)</span>
              </div>
            </div>
            <Link
              href={`/book?artist=${artist.id}`}
              className="rounded-full bg-joshoBlue px-6 py-2.5 text-sm font-bold text-white shadow-panel hover:opacity-90"
            >
              Book Now
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {genres.map((g) => (
              <span key={g} className="rounded-full bg-joshoBlue/20 px-3 py-1 text-xs font-medium text-blue-200">{g}</span>
            ))}
            {instruments.map((i) => (
              <span key={i} className="rounded bg-[#1a2d4d] px-2 py-1 text-xs text-blue-300">{i}</span>
            ))}
          </div>

          {(artist.event_rate as number | null) && (
            <p className="mt-3 text-lg font-bold text-white">
              &#8377;{(artist.event_rate as number).toLocaleString("en-IN")} <span className="text-sm font-normal text-blue-300">per event</span>
            </p>
          )}
        </div>
      </section>

      {/* Bio */}
      {(artist.bio as string | null) && (
        <section className="mb-6 rounded-xl border border-blue-900/30 bg-[#13213d] p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-300">About</h2>
          <p className="text-sm leading-relaxed text-blue-100">{artist.bio as string}</p>
        </section>
      )}

      {/* Media gallery */}
      {media.length > 0 && (
        <section className="mb-6 rounded-xl border border-blue-900/30 bg-[#13213d] p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-300">Media</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.map((m: Record<string, unknown>) => (
              <div key={m.id as string} className="overflow-hidden rounded-lg bg-[#0d1a30]">
                {(m.media_type as string) === "youtube" ? (
                  <iframe
                    src={(m.url as string).replace("watch?v=", "embed/")}
                    className="aspect-video w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                    allowFullScreen
                  />
                ) : (m.media_type as string) === "image" ? (
                  <img src={m.url as string} alt={(m.title as string) ?? ""} className="aspect-video w-full object-cover" />
                ) : (
                  <div className="flex aspect-video items-center justify-center">
                    <audio controls src={m.url as string} className="w-4/5" />
                  </div>
                )}
                {(m.title as string | null) && <p className="px-2 py-1.5 text-xs text-blue-200">{m.title as string}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Perfect Match — band recommendations */}
      {recommendations.length > 0 && (
        <section className="mb-6 rounded-xl border border-amber-700/30 bg-[#1a2210] p-5">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-amber-400">Perfect Match</h2>
          <p className="mb-3 text-xs text-amber-200/70">Complete your band — pair {artist.stage_name as string} with these artists</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {recommendations.map((rec: Record<string, unknown>) => {
              const rArtist = rec.artist_profiles as Record<string, unknown>;
              const rInstruments = ((rArtist?.artist_instruments as Array<{ instruments: { name: string } }>) ?? [])
                .map((i) => i.instruments.name)
                .join(", ");
              return (
                <Link
                  key={rec.recommended_id as string}
                  href={`/artists/${rArtist?.id}`}
                  className="flex items-center gap-3 rounded-lg border border-amber-800/30 bg-[#13213d] p-3 transition hover:border-amber-600/50"
                >
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-[#0d1a30]">
                    {(rArtist?.profile_photo as string | null) ? (
                      <img src={rArtist.profile_photo as string} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-blue-600">
                        {(rArtist?.stage_name as string)?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{rArtist?.stage_name as string}</p>
                    <p className="text-[10px] text-amber-300">{rInstruments}</p>
                    <p className="text-xs text-blue-200">&#8377;{((rArtist?.event_rate as number) ?? 0).toLocaleString("en-IN")}</p>
                  </div>
                </Link>
              );
            })}
          </div>
          <Link
            href={`/book?artist=${artist.id}&band=true`}
            className="mt-4 inline-block rounded-full bg-amber-600 px-5 py-2 text-sm font-bold text-black hover:bg-amber-500"
          >
            Book Full Band
          </Link>
        </section>
      )}

      {/* Reviews */}
      <section className="mb-6 rounded-xl border border-blue-900/30 bg-[#13213d] p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-300">
          Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-blue-400">No reviews yet. Be the first to book!</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r: Record<string, unknown>) => (
              <div key={r.id as string} className="rounded-lg border border-blue-900/20 bg-[#0d1a30] p-3">
                <div className="flex items-center gap-2">
                  <RatingStars rating={r.rating as number} size="sm" />
                  <span className="text-xs text-blue-400">
                    {((r.profiles as Record<string, unknown>)?.full_name as string) ?? "Anonymous"}
                  </span>
                </div>
                {(r.comment as string | null) && <p className="mt-1 text-sm text-blue-100">{r.comment as string}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-joshoBlue/30 bg-gradient-to-r from-joshoNavy to-[#162746] p-6 text-center">
        <h2 className="text-xl font-bold text-white">Ready to book {artist.stage_name as string}?</h2>
        <p className="mt-1 text-sm text-blue-200">Free to browse. We only charge 10% after a successful event.</p>
        <Link
          href={`/book?artist=${artist.id}`}
          className="mt-4 inline-block rounded-full bg-joshoBlue px-8 py-3 font-bold text-white hover:opacity-90"
        >
          Start Booking
        </Link>
      </section>
    </main>
  );
}
