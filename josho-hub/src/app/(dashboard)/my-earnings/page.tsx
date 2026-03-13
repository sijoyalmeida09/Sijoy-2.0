import { requireProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function MyEarningsPage() {
  const profile = await requireProfile();
  if (profile.role !== "musician" && profile.role !== "admin") redirect("/dashboard");

  const supabase = createServerSupabaseClient();

  const { data: artist } = await supabase
    .from("artist_profiles")
    .select("id")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!artist) return <p className="text-blue-300">No artist profile found.</p>;

  const { data: completedBookings } = await supabase
    .from("event_bookings")
    .select("id, event_name, event_date, artist_payout, payout_status")
    .eq("artist_id", artist.id)
    .eq("status", "completed")
    .order("event_date", { ascending: false });

  const rows = completedBookings ?? [];
  const totalEarned = rows.filter((b) => b.payout_status === "settled").reduce((s, b) => s + Number(b.artist_payout), 0);
  const totalPending = rows.filter((b) => b.payout_status !== "settled").reduce((s, b) => s + Number(b.artist_payout), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">My Earnings</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-green-800/30 bg-[#0d2818] p-4">
          <p className="text-xs uppercase tracking-wide text-green-300">Total Earned (settled)</p>
          <p className="mt-1 text-2xl font-bold text-white">&#8377;{totalEarned.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl border border-amber-800/30 bg-[#1a2210] p-4">
          <p className="text-xs uppercase tracking-wide text-amber-300">Pending Settlement</p>
          <p className="mt-1 text-2xl font-bold text-white">&#8377;{totalPending.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((b) => (
          <div key={b.id as string} className="flex items-center justify-between rounded-lg border border-blue-900/20 bg-[#0d1a30] p-3">
            <div>
              <p className="text-sm font-medium text-white">{b.event_name as string}</p>
              <p className="text-xs text-blue-400">{String(b.event_date).slice(0, 10)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">&#8377;{(b.artist_payout as number).toLocaleString("en-IN")}</p>
              <span className={`text-[10px] uppercase ${b.payout_status === "settled" ? "text-green-400" : "text-amber-400"}`}>
                {b.payout_status as string}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
