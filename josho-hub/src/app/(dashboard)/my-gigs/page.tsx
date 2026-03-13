import { requireProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MyGigsPage() {
  const profile = await requireProfile();
  if (profile.role !== "musician" && profile.role !== "admin") redirect("/dashboard");

  const supabase = createServerSupabaseClient();

  const { data: artist } = await supabase
    .from("artist_profiles")
    .select("id")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!artist) {
    return (
      <div className="p-6 text-center">
        <p className="text-blue-200">No artist profile found.</p>
        <Link href="/join" className="mt-3 inline-block rounded-full bg-joshoBlue px-5 py-2 text-sm font-bold text-white">
          Create Artist Profile
        </Link>
      </div>
    );
  }

  const { data: bookings } = await supabase
    .from("event_bookings")
    .select("id, event_name, event_type, event_date, venue, city, agreed_amount, artist_payout, status, payout_status")
    .eq("artist_id", artist.id)
    .order("event_date", { ascending: false });

  const rows = bookings ?? [];
  const upcoming = rows.filter((b) => ["requested", "accepted", "confirmed"].includes(b.status as string));
  const past = rows.filter((b) => ["completed", "cancelled", "disputed"].includes(b.status as string));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">My Gigs</h2>

      {/* Incoming requests */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-400">
          Upcoming &amp; Requests ({upcoming.length})
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-blue-300">No upcoming gigs. Share your profile to get booked!</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <Link
                key={b.id as string}
                href={`/my-gigs/${b.id}`}
                className="block rounded-xl border border-blue-900/30 bg-[#0d1a30] p-4 transition hover:border-joshoBlue/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">{b.event_name as string}</p>
                    <p className="text-xs text-blue-300">
                      {b.event_type as string} &middot; {String(b.event_date).slice(0, 10)} &middot; {(b.venue as string) ?? (b.city as string)}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    b.status === "requested" ? "bg-amber-600/20 text-amber-300" :
                    b.status === "confirmed" ? "bg-green-600/20 text-green-300" :
                    "bg-blue-600/20 text-blue-300"
                  }`}>
                    {b.status as string}
                  </span>
                </div>
                <p className="mt-2 text-sm text-blue-100">
                  You earn: <span className="font-bold text-white">&#8377;{(b.artist_payout as number).toLocaleString("en-IN")}</span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Past gigs */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-400">
          Past Gigs ({past.length})
        </h3>
        {past.length === 0 ? (
          <p className="text-sm text-blue-400">No past gigs yet.</p>
        ) : (
          <div className="space-y-2">
            {past.map((b) => (
              <div key={b.id as string} className="flex items-center justify-between rounded-lg border border-blue-900/20 bg-[#0d1a30] p-3">
                <div>
                  <p className="text-sm font-medium text-white">{b.event_name as string}</p>
                  <p className="text-xs text-blue-400">{String(b.event_date).slice(0, 10)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">&#8377;{(b.artist_payout as number).toLocaleString("en-IN")}</p>
                  <span className={`text-[10px] uppercase ${
                    b.payout_status === "settled" ? "text-green-400" : "text-blue-400"
                  }`}>
                    {b.payout_status as string}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
