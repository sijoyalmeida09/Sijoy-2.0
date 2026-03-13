import { requireProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function MyBookingsPage() {
  const profile = await requireProfile();
  const supabase = createServerSupabaseClient();

  const { data: bookings } = await supabase
    .from("event_bookings")
    .select("id, event_name, event_type, event_date, venue, city, agreed_amount, status, artist_profiles!event_bookings_artist_id_fkey ( stage_name, profile_photo )")
    .eq("organizer_id", profile.id)
    .order("event_date", { ascending: false });

  const rows = bookings ?? [];
  const active = rows.filter((b) => ["requested", "accepted", "confirmed"].includes(b.status as string));
  const past = rows.filter((b) => ["completed", "cancelled", "disputed"].includes(b.status as string));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">My Bookings</h2>
        <Link href="/discover" className="rounded-full bg-joshoBlue px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90">
          Book an Artist
        </Link>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-400">Active ({active.length})</h3>
        {active.length === 0 ? (
          <p className="text-sm text-blue-300">No active bookings.</p>
        ) : (
          <div className="space-y-3">
            {active.map((b) => {
              const artist = b.artist_profiles as Record<string, unknown> | null;
              return (
                <Link
                  key={b.id as string}
                  href={`/my-bookings/${b.id}`}
                  className="flex items-center gap-4 rounded-xl border border-blue-900/30 bg-[#0d1a30] p-4 transition hover:border-joshoBlue/50"
                >
                  <div className="h-12 w-12 overflow-hidden rounded-lg bg-[#13213d]">
                    {(artist?.profile_photo as string | null) ? (
                      <img src={artist.profile_photo as string} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-lg text-blue-600">
                        {(artist?.stage_name as string)?.charAt(0) ?? "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{b.event_name as string}</p>
                    <p className="text-xs text-blue-300">
                      {(artist?.stage_name as string) ?? "Artist"} &middot; {String(b.event_date).slice(0, 10)} &middot; {(b.venue as string) ?? (b.city as string)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">&#8377;{(b.agreed_amount as number).toLocaleString("en-IN")}</p>
                    <span className={`text-[10px] uppercase ${
                      b.status === "requested" ? "text-amber-300" :
                      b.status === "confirmed" ? "text-green-300" :
                      "text-blue-300"
                    }`}>
                      {b.status as string}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-400">Past ({past.length})</h3>
        {past.length === 0 ? (
          <p className="text-sm text-blue-400">No past bookings.</p>
        ) : (
          <div className="space-y-2">
            {past.map((b) => {
              const artist = b.artist_profiles as Record<string, unknown> | null;
              return (
                <Link
                  key={b.id as string}
                  href={`/my-bookings/${b.id}`}
                  className="flex items-center justify-between rounded-lg border border-blue-900/20 bg-[#0d1a30] p-3 transition hover:border-blue-800/40"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{b.event_name as string}</p>
                    <p className="text-xs text-blue-400">{(artist?.stage_name as string) ?? "Artist"} &middot; {String(b.event_date).slice(0, 10)}</p>
                  </div>
                  <span className={`text-[10px] uppercase ${b.status === "completed" ? "text-green-400" : "text-red-400"}`}>
                    {b.status as string}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
