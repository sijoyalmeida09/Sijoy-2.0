import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RatingStars } from "@/components/music/rating-stars";
import { MediaCarousel } from "@/components/music/media-carousel";

async function getArtist(id: string) {
  const supabase = createServerSupabaseClient();

  const { data: artist, error } = await supabase
    .from("artist_profiles")
    .select(`
      id, user_id, stage_name, bio, event_rate, hourly_rate, city, region,
      profile_photo, cover_photo, youtube_url, instagram_url,
      avg_rating, total_bookings, featured, verification_status, available
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[ArtistDetail] Error:", error.message);
  }

  return artist;
}

async function getArtistGenres(artistId: string) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("artist_genres")
    .select("genres ( slug, name )")
    .eq("artist_id", artistId);
  return (data ?? []).map((row) => {
    const r = row as unknown as { genres: { slug: string; name: string } | null };
    return r.genres?.name ?? "";
  }).filter(Boolean);
}

async function getArtistInstruments(artistId: string) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("artist_instruments")
    .select("instruments ( slug, name )")
    .eq("artist_id", artistId);
  return (data ?? []).map((row) => {
    const r = row as unknown as { instruments: { slug: string; name: string } | null };
    return r.instruments?.name ?? "";
  }).filter(Boolean);
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

async function getReviews(userId: string) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("booking_reviews")
    .select("id, rating, comment, created_at, reviewer_id, profiles!booking_reviews_reviewer_id_fkey ( full_name )")
    .eq("reviewee_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  return data ?? [];
}

async function getRecommendations(artistId: string) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("artist_recommendations")
    .select("recommended_id, reason, score, artist_profiles!artist_recommendations_recommended_id_fkey ( id, stage_name, profile_photo, event_rate )")
    .eq("source_artist", artistId)
    .order("score", { ascending: false })
    .limit(6);
  return data ?? [];
}

export default async function ArtistProfilePage({ params }: { params: { id: string } }) {
  const artist = await getArtist(params.id);
  if (!artist) notFound();

  const [genres, instruments, media, reviews, recommendations] = await Promise.all([
    getArtistGenres(artist.id as string),
    getArtistInstruments(artist.id as string),
    getMedia(artist.id as string),
    getReviews(artist.user_id as string),
    getRecommendations(artist.id as string)
  ]);

  const avgRating = (artist.avg_rating as number) || 4.5;
  const totalBookings = (artist.total_bookings as number) || 0;
  const isAvailable = artist.available as boolean;
  const stageName = artist.stage_name as string;
  const city = artist.city as string;
  const region = artist.region as string;
  const eventRate = artist.event_rate as number | null;

  return (
    <div className="min-h-screen bg-josho-bg">
      {/* ── HERO ──────────────────────────────────── */}
      <section className="relative h-[55vh] min-h-[320px] w-full overflow-hidden">
        {/* Cover photo or gradient */}
        <div className="absolute inset-0">
          {(artist.cover_photo as string | null) ? (
            <img
              src={artist.cover_photo as string}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-josho-elevated via-josho-surface to-josho-bg" />
          )}
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-josho-bg/20 via-josho-bg/40 to-josho-bg" />
        </div>

        {/* Hero Content — centered at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 sm:px-6">
          <div className="mx-auto max-w-6xl flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-josho-glow/50 bg-josho-elevated shadow-[0_0_30px_rgba(91,94,244,0.3)]">
              {(artist.profile_photo as string | null) ? (
                <img
                  src={artist.profile_photo as string}
                  alt={stageName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl text-electric">
                  {stageName.charAt(0)}
                </div>
              )}
            </div>

            {/* Name */}
            <h1 className="text-3xl font-black tracking-tight text-[#eeeef8] sm:text-4xl">{stageName}</h1>

            {/* Badges row */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {genres.slice(0, 3).map((g) => (
                <span key={g} className="rounded-full border border-josho-glow/50 bg-josho-surface/80 px-3 py-0.5 text-xs font-medium text-[#9090b0] backdrop-blur-sm">
                  {g}
                </span>
              ))}
              <span className="text-[#505070]">·</span>
              <span className="text-sm text-[#9090b0]">{city}{region ? `, ${region}` : ""}</span>
              <span className="text-[#505070]">·</span>
              <span className="flex items-center gap-1 text-sm">
                <span className="text-gold">★</span>
                <span className="font-medium text-[#eeeef8]">{avgRating.toFixed(1)}</span>
              </span>
              {isAvailable && (
                <span className="flex items-center gap-1 rounded-full bg-teal/10 px-3 py-0.5 text-xs font-bold text-teal border border-teal/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                  Online Now
                </span>
              )}
            </div>

            {/* CTAs */}
            <div className="mt-5 flex gap-3">
              <Link
                href={`/book?artist=${artist.id}`}
                className="btn-electric px-8 py-3 text-sm"
              >
                Quick Book
              </Link>
              <Link
                href={`/book?artist=${artist.id}&type=enquiry`}
                className="rounded-full border border-josho-glow/50 px-8 py-3 text-sm font-medium text-[#eeeef8] transition-all hover:border-josho-glow hover:bg-josho-surface"
              >
                Send Enquiry
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TWO-COLUMN BODY ───────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* ── LEFT (70%) ─────────────────────────── */}
          <div className="flex-1 space-y-6">
            {/* About */}
            <div className="rounded-2xl border border-josho-border bg-josho-surface p-6">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#9090b0]">
                About
              </h2>
              {(artist.bio as string | null) ? (
                <p className="text-sm leading-relaxed text-[#eeeef8]">{artist.bio as string}</p>
              ) : (
                <p className="text-sm leading-relaxed text-[#505070] italic">
                  This artist is currently updating their profile. Message them directly!
                </p>
              )}
            </div>

            {/* Social Links */}
            {((artist.youtube_url as string | null) || (artist.instagram_url as string | null)) && (
              <div className="flex flex-wrap gap-3">
                {(artist.youtube_url as string | null) && (
                  <a
                    href={artist.youtube_url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-red-800/40 bg-red-900/10 px-4 py-2.5 text-sm font-medium text-red-300 transition-all hover:border-red-600/50 hover:bg-red-900/20"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    View YouTube
                  </a>
                )}
                {(artist.instagram_url as string | null) && (
                  <a
                    href={artist.instagram_url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-pink-800/40 bg-pink-900/10 px-4 py-2.5 text-sm font-medium text-pink-300 transition-all hover:border-pink-600/50 hover:bg-pink-900/20"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    View Instagram
                  </a>
                )}
              </div>
            )}

            {/* Media */}
            {media.length > 0 && (
              <div className="rounded-2xl border border-josho-border bg-josho-surface p-6">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#9090b0]">Listen</h2>
                <MediaCarousel
                  items={media.map((m: Record<string, unknown>) => ({
                    id: m.id as string,
                    media_type: m.media_type as "image" | "video" | "audio" | "youtube",
                    url: m.url as string,
                    thumbnail: (m.thumbnail as string) ?? null,
                    title: (m.title as string) ?? null,
                    sort_order: (m.sort_order as number) ?? 0
                  }))}
                />
              </div>
            )}

            {/* Events Kiye */}
            <div className="rounded-2xl border border-josho-border bg-josho-surface p-6">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#9090b0]">Events Done</h2>
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <p className="text-3xl font-black text-gradient-electric">{totalBookings}</p>
                  <p className="text-xs text-[#9090b0]">Total Bookings</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-gradient-electric">{avgRating.toFixed(1)}★</p>
                  <p className="text-xs text-[#9090b0]">Avg Rating</p>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {genres.map((g) => (
                      <span key={g} className="rounded-full bg-josho-elevated px-2.5 py-1 text-xs text-[#9090b0]">{g}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="rounded-2xl border border-josho-border bg-josho-surface p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[#9090b0]">
                  Reviews ({reviews.length})
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <RatingStars rating={avgRating} size="sm" />
                    <span className="text-sm font-bold text-gold">{avgRating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="rounded-xl bg-josho-elevated p-6 text-center">
                  <p className="text-3xl mb-2">🌟</p>
                  <p className="text-sm font-medium text-[#eeeef8]">No reviews yet</p>
                  <p className="mt-1 text-xs text-[#505070]">Be the first to book and leave a review!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r: Record<string, unknown>) => {
                    const reviewer = (r.profiles as Record<string, unknown>)?.full_name as string ?? "Anonymous";
                    const initial = reviewer.charAt(0).toUpperCase();
                    return (
                      <div key={r.id as string} className="rounded-xl border border-josho-border bg-josho-elevated p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-electric/20 text-xs font-bold text-electric">
                            {initial}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-[#eeeef8]">{reviewer}</span>
                              <RatingStars rating={r.rating as number} size="sm" />
                            </div>
                            {(r.comment as string | null) && (
                              <p className="text-sm leading-relaxed text-[#9090b0]">{r.comment as string}</p>
                            )}
                            <p className="mt-1 text-xs text-[#505070]">Hired for: Wedding · {new Date(r.created_at as string).getFullYear()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Perfect Match — Band Builder */}
            {recommendations.length > 0 && (
              <div className="rounded-2xl border border-gold/20 bg-josho-surface p-6">
                <div className="mb-1 flex items-center gap-2">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-gold">Perfect Match — Build a Band</h2>
                </div>
                <p className="mb-4 text-xs text-[#9090b0]">
                  Book these artists alongside {stageName} — a perfect combination!
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {recommendations.map((rec: Record<string, unknown>) => {
                    const rArtist = rec.artist_profiles as Record<string, unknown>;
                    return (
                      <Link
                        key={rec.recommended_id as string}
                        href={`/artists/${rArtist?.id}`}
                        className="flex items-center gap-3 rounded-xl border border-gold/20 bg-josho-elevated p-3 transition-all hover:border-gold/50"
                      >
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-josho-surface flex-shrink-0">
                          {(rArtist?.profile_photo as string | null) ? (
                            <img src={rArtist.profile_photo as string} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-gold">
                              {(rArtist?.stage_name as string)?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#eeeef8]">{rArtist?.stage_name as string}</p>
                          <p className="text-xs text-gold">₹{((rArtist?.event_rate as number) ?? 0).toLocaleString("en-IN")}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <Link
                  href={`/book?artist=${artist.id}&band=true`}
                  className="mt-4 inline-block rounded-xl border border-gold/40 bg-gold/10 px-5 py-2 text-sm font-bold text-gold transition-all hover:bg-gold/20"
                >
                  Book Them Together →
                </Link>
              </div>
            )}
          </div>

          {/* ── RIGHT: Booking Card (sticky) ─────── */}
          <aside className="w-full lg:w-80 lg:flex-shrink-0">
            <div className="sticky top-28 rounded-2xl border border-josho-glow/40 bg-josho-elevated p-6 shadow-electric">
              {/* Price */}
              <div className="mb-4">
                {eventRate ? (
                  <>
                    <p className="text-3xl font-black text-gradient-electric">
                      ₹{eventRate.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-[#9090b0]">per event</p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-[#eeeef8]">Rate on request</p>
                )}
              </div>

              {/* Availability badge */}
              {isAvailable && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-teal/10 px-3 py-2 border border-teal/20">
                  <span className="h-2 w-2 rounded-full bg-teal" />
                  <span className="text-xs font-medium text-teal">Available Today</span>
                </div>
              )}

              {/* Travel */}
              <p className="mb-4 text-xs text-[#505070]">
                📍 Available in {city}. Mumbai possible too.
              </p>

              {/* Booking Form */}
              <div className="space-y-3 mb-5">
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[#505070]">Event Type</label>
                  <select className="w-full rounded-xl border border-josho-border bg-josho-surface px-3 py-2.5 text-sm text-[#eeeef8] outline-none focus:border-electric/60">
                    <option>Wedding Reception</option>
                    <option>Birthday Party</option>
                    <option>Corporate Event</option>
                    <option>House Party</option>
                    <option>Religious Ceremony</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[#505070]">Event Date</label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-josho-border bg-josho-surface px-3 py-2.5 text-sm text-[#eeeef8] outline-none focus:border-electric/60"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[#505070]">Duration</label>
                  <select className="w-full rounded-xl border border-josho-border bg-josho-surface px-3 py-2.5 text-sm text-[#eeeef8] outline-none focus:border-electric/60">
                    <option>1 Hour</option>
                    <option>2 Hours</option>
                    <option>3 Hours</option>
                    <option>4+ Hours (Full Event)</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                <Link
                  href={`/book?artist=${artist.id}`}
                  className="btn-electric block w-full py-3 text-center text-sm"
                >
                  Book Now
                </Link>
                <Link
                  href={`/book?artist=${artist.id}&type=enquiry`}
                  className="block w-full rounded-xl border border-josho-glow/50 py-3 text-center text-sm font-medium text-[#9090b0] transition-all hover:border-josho-glow hover:text-[#eeeef8]"
                >
                  Send Enquiry
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="mt-5 space-y-1.5 border-t border-josho-border pt-4">
                <p className="flex items-center gap-2 text-xs text-[#9090b0]">
                  <span className="text-teal">✓</span> Verified Artist
                </p>
                <p className="flex items-center gap-2 text-xs text-[#9090b0]">
                  <span className="text-teal">✓</span> {totalBookings} successful bookings
                </p>
                <p className="flex items-center gap-2 text-xs text-[#9090b0]">
                  <span className="text-teal">✓</span> Only 20% advance — rest at the event
                </p>
                <p className="flex items-center gap-2 text-xs text-[#9090b0]">
                  <span className="text-teal">✓</span> Razorpay secure payment
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
