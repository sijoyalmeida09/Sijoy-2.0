import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BookingWizard } from "./booking-wizard";

async function getArtistForBooking(artistId: string) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("artist_profiles")
    .select("id, user_id, stage_name, event_rate, profile_photo, commission_pct, artist_instruments ( instruments ( name ) )")
    .eq("id", artistId)
    .maybeSingle();
  return data;
}

async function getBandRecommendations(artistId: string) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("artist_recommendations")
    .select("recommended_id, reason, artist_profiles!artist_recommendations_recommended_id_fkey ( id, stage_name, profile_photo, event_rate, artist_instruments ( instruments ( name ) ) )")
    .eq("source_artist", artistId)
    .order("score", { ascending: false })
    .limit(8);
  return data ?? [];
}

export default async function BookPage({
  searchParams
}: {
  searchParams: { artist?: string; band?: string };
}) {
  const artistId = searchParams.artist;
  if (!artistId) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4">
        <div className="rounded-xl border border-blue-900/30 bg-[#13213d] p-8 text-center">
          <h1 className="text-xl font-bold text-white">No artist selected</h1>
          <p className="mt-2 text-sm text-blue-200">Go back to discover and pick an artist first.</p>
          <a href="/discover" className="mt-4 inline-block rounded-full bg-joshoBlue px-6 py-2 text-sm font-bold text-white">
            Browse Artists
          </a>
        </div>
      </main>
    );
  }

  const artist = await getArtistForBooking(artistId);
  if (!artist) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4">
        <div className="rounded-xl border border-blue-900/30 bg-[#13213d] p-8 text-center">
          <h1 className="text-xl font-bold text-white">Artist not found</h1>
          <a href="/discover" className="mt-4 inline-block rounded-full bg-joshoBlue px-6 py-2 text-sm font-bold text-white">
            Browse Artists
          </a>
        </div>
      </main>
    );
  }

  const showBand = searchParams.band === "true";
  const recommendations = showBand ? await getBandRecommendations(artistId) : [];

  const bandMembers = recommendations.map((rec: Record<string, unknown>) => {
    const rArtist = rec.artist_profiles as Record<string, unknown>;
    const instruments = ((rArtist?.artist_instruments as Array<{ instruments: { name: string } }>) ?? [])
      .map((i) => i.instruments.name);
    return {
      artistId: rArtist?.id as string,
      stageName: rArtist?.stage_name as string,
      instrument: instruments[0] ?? "Multi",
      eventRate: (rArtist?.event_rate as number) ?? 0,
      profilePhoto: (rArtist?.profile_photo as string) ?? null
    };
  });

  const leadInstruments = ((artist.artist_instruments as Array<{ instruments: { name: string } }>) ?? [])
    .map((i) => i.instruments.name);

  return (
    <BookingWizard
      leadArtist={{
        id: artist.id as string,
        stageName: artist.stage_name as string,
        eventRate: (artist.event_rate as number) ?? 0,
        profilePhoto: (artist.profile_photo as string) ?? null,
        instrument: leadInstruments[0] ?? "Multi",
        commissionPct: artist.commission_pct as number
      }}
      bandMembers={bandMembers}
      showBandStep={showBand}
    />
  );
}
