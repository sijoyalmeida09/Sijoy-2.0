import { requireProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { GigActions } from "./gig-actions";

export default async function GigDetailPage({ params }: { params: { id: string } }) {
  const profile = await requireProfile();
  if (profile.role !== "musician" && profile.role !== "admin") redirect("/dashboard");

  const supabase = createServerSupabaseClient();

  const { data: booking } = await supabase
    .from("event_bookings")
    .select("*, profiles!event_bookings_organizer_id_fkey ( full_name, email )")
    .eq("id", params.id)
    .maybeSingle();

  if (!booking) notFound();

  const organizer = booking.profiles as Record<string, unknown> | null;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-white">{booking.event_name as string}</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-blue-900/20 bg-[#0d1a30] p-3">
          <p className="text-xs text-blue-400">Event Type</p>
          <p className="text-sm text-white">{booking.event_type as string}</p>
        </div>
        <div className="rounded-lg border border-blue-900/20 bg-[#0d1a30] p-3">
          <p className="text-xs text-blue-400">Date</p>
          <p className="text-sm text-white">{String(booking.event_date).slice(0, 10)}</p>
        </div>
        <div className="rounded-lg border border-blue-900/20 bg-[#0d1a30] p-3">
          <p className="text-xs text-blue-400">Venue</p>
          <p className="text-sm text-white">{(booking.venue as string) ?? "TBD"}</p>
        </div>
        <div className="rounded-lg border border-blue-900/20 bg-[#0d1a30] p-3">
          <p className="text-xs text-blue-400">Organizer</p>
          <p className="text-sm text-white">{(organizer?.full_name as string) ?? (organizer?.email as string) ?? "Unknown"}</p>
        </div>
        <div className="rounded-lg border border-blue-900/20 bg-[#0d1a30] p-3">
          <p className="text-xs text-blue-400">Your Payout</p>
          <p className="text-lg font-bold text-white">&#8377;{(booking.artist_payout as number).toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-lg border border-blue-900/20 bg-[#0d1a30] p-3">
          <p className="text-xs text-blue-400">Status</p>
          <p className="text-sm font-semibold text-white">{booking.status as string}</p>
        </div>
      </div>

      {(booking.description as string | null) && (
        <div className="rounded-lg border border-blue-900/20 bg-[#0d1a30] p-3">
          <p className="text-xs text-blue-400">Description</p>
          <p className="mt-1 text-sm text-blue-100">{booking.description as string}</p>
        </div>
      )}

      <GigActions bookingId={params.id} currentStatus={booking.status as string} />
    </div>
  );
}
