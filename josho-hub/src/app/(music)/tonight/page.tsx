import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ArtistCard } from "@/components/music/artist-card";

async function getTonightArtists() {
  const supabase = createServerSupabaseClient();

  const { data: artists, error } = await supabase
    .from("artist_profiles")
    .select("id, user_id, stage_name, bio, event_rate, city, profile_photo, avg_rating, total_bookings, featured, available, verification_status, is_online")
    .eq("is_online", true)
    .eq("verification_status", "verified")
    .order("total_bookings", { ascending: false })
    .limit(24);

  if (error) {
    console.error("[Tonight] Error:", error.message);
  }

  const { data: instrumentRows } = await supabase
    .from("artist_instruments")
    .select("artist_id, instruments ( slug, name )");

  const instrumentsByArtist = new Map<string, string[]>();
  (instrumentRows ?? []).forEach((row) => {
    const r = row as unknown as { artist_id: string; instruments: { name: string } | null };
    if (!r.instruments) return;
    const list = instrumentsByArtist.get(r.artist_id) ?? [];
    list.push(r.instruments.name);
    instrumentsByArtist.set(r.artist_id, list);
  });

  const { data: genreRows } = await supabase
    .from("artist_genres")
    .select("artist_id, genres ( slug, name )");

  const genresByArtist = new Map<string, string[]>();
  (genreRows ?? []).forEach((row) => {
    const r = row as unknown as { artist_id: string; genres: { name: string } | null };
    if (!r.genres) return;
    const list = genresByArtist.get(r.artist_id) ?? [];
    list.push(r.genres.name);
    genresByArtist.set(r.artist_id, list);
  });

  return (artists ?? []).map((a) => ({
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
    genres: genresByArtist.get(a.id as string) ?? [],
    instruments: instrumentsByArtist.get(a.id as string) ?? []
  }));
}

const LOCATIONS = ["Vasai", "Virar", "Nalasopara", "Mumbai"];
const TIMES = ["6 PM", "7 PM", "8 PM", "9 PM+"];

export default async function TonightPage() {
  const artists = await getTonightArtists();

  return (
    <div className="min-h-screen bg-josho-bg">
      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-josho-border px-4 py-16 sm:px-6"
        style={{
          background: "linear-gradient(135deg, rgba(255,51,85,0.08) 0%, rgba(14,15,29,1) 60%)"
        }}
      >
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-crimson/8 blur-3xl" />

        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-crimson/30 bg-crimson/10 px-4 py-1.5">
            <span
              className="h-2 w-2 rounded-full bg-crimson"
              style={{ animation: "pulse-dot 1.5s ease-in-out infinite" }}
            />
            <span className="text-sm font-bold uppercase tracking-wider text-crimson">Live Tonight</span>
          </div>

          <h1 className="mb-4 text-4xl font-black tracking-tight text-[#eeeef8] sm:text-5xl lg:text-6xl">
            For Tonight —{" "}
            <span className="text-crimson">Instant Booking</span>
          </h1>
          <p className="mb-8 text-lg text-[#9090b0]">
            Last-minute event? These artists are available tonight. Confirmed in 30 minutes.
          </p>

          {/* Filter Chips */}
          <div className="flex flex-wrap justify-center gap-8">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#505070]">Location</p>
              <div className="flex gap-2">
                {LOCATIONS.map((loc) => (
                  <span
                    key={loc}
                    className="cursor-pointer rounded-full border border-josho-border bg-josho-surface px-4 py-1.5 text-sm text-[#9090b0] transition-all hover:border-crimson/50 hover:text-[#eeeef8]"
                  >
                    {loc}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#505070]">Start Time</p>
              <div className="flex gap-2">
                {TIMES.map((t) => (
                  <span
                    key={t}
                    className="cursor-pointer rounded-full border border-josho-border bg-josho-surface px-4 py-1.5 text-sm text-[#9090b0] transition-all hover:border-crimson/50 hover:text-[#eeeef8]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="border-b border-josho-border bg-josho-surface px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-6 text-xs text-[#505070]">
          <span className="flex items-center gap-1.5"><span className="text-teal">✓</span> Razorpay secure payment</span>
          <span className="hidden sm:flex items-center gap-1.5"><span className="text-teal">✓</span> 20% advance only</span>
          <span className="hidden sm:flex items-center gap-1.5"><span className="text-teal">✓</span> Artist guarantee</span>
          <span className="flex items-center gap-1.5"><span className="text-crimson">🔴</span> 30 min confirmation</span>
        </div>
      </div>

      {/* Available Count */}
      <div className="px-4 pt-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="badge-live">TONIGHT</span>
            <p className="text-[#9090b0]">
              <span className="font-bold text-[#eeeef8]">{artists.length}</span> artists available tonight in Vasai-Virar
            </p>
          </div>
        </div>
      </div>

      {/* Artist Grid */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {artists.length === 0 ? (
            <div className="rounded-2xl border border-josho-border bg-josho-surface p-16 text-center">
              <p className="text-4xl mb-4">😴</p>
              <p className="text-[#eeeef8] font-bold">No one available right now</p>
              <p className="mt-2 text-sm text-[#9090b0]">Browse for tomorrow!</p>
              <Link href="/discover" className="btn-electric mt-6 inline-block px-8 py-3 text-sm">
                View All Artists
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {artists.map((a) => (
                <div key={a.id} className="relative">
                  {/* Tonight badge overlay */}
                  <div className="absolute left-3 top-3 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-crimson/20 px-2.5 py-0.5 text-[10px] font-bold text-crimson border border-crimson/30 backdrop-blur-sm">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-crimson"
                        style={{ animation: "pulse-dot 1.5s ease-in-out infinite" }}
                      />
                      TONIGHT
                    </span>
                  </div>
                  <ArtistCard
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
                    bio={a.bio}
                    city={a.city}
                    availableTonight={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gear CTA */}
      <section className="border-t border-josho-border px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-electric/20 bg-josho-surface p-8 text-center">
          <h2 className="text-xl font-black text-[#eeeef8]">Need gear too?</h2>
          <p className="mt-2 text-sm text-[#9090b0]">
            Rent a PA system, mic, or lighting for tonight. Last-minute availability.
          </p>
          <Link href="/gear" className="btn-electric mt-5 inline-block px-8 py-3 text-sm">
            Find Gear Tonight →
          </Link>
        </div>
      </section>
    </div>
  );
}
