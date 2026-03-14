import { requireProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ReviewForm } from "./review-form";

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const profile = await requireProfile();
  const supabase = createServerSupabaseClient();

  const { data: booking } = await supabase
    .from("event_bookings")
    .select("*, artist_profiles!event_bookings_artist_id_fkey ( id, user_id, stage_name, profile_photo )")
    .eq("id", params.id)
    .eq("organizer_id", profile.id)
    .maybeSingle();

  if (!booking) notFound();

  const artist = booking.artist_profiles as Record<string, unknown> | null;

  const { data: existingReview } = await supabase
    .from("booking_reviews")
    .select("id")
    .eq("booking_id", params.id)
    .eq("reviewer_id", profile.id)
    .maybeSingle();

  const canReview = booking.status === "completed" && !existingReview;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-white">{booking.event_name as string}</h2>

      <div className="flex items-center gap-4 rounded-xl border border-blue-900/30 bg-[#0d1a30] p-4">
        <div className="h-14 w-14 overflow-hidden rounded-lg bg-[#13213d]">
          {(artist?.profile_photo as string | null) ? (
            <img src={artist?.profile_photo as string} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xl text-blue-600">
              {(artist?.stage_name as string)?.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <p className="font-semibold text-white">{artist?.stage_name as string}</p>
          <Link href={`/artists/${artist?.id}`} className="text-xs text-joshoBlue hover:underline">
            View Profile
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-blue-900/20 bg-[#0d1a30] p-3">
          <p className="text-xs text-blue-400">Date</p>
          <p className="text-sm text-white">{String(booking.event_date).slice(0, 10)}</p>
        </div>
        <div className="rounded-lg border border-blue-900/20 bg-[#0d1a30] p-3">
          <p className="text-xs text-blue-400">Venue</p>
          <p className="text-sm text-white">{(booking.venue as string) ?? "TBD"}</p>
        </div>
        <div className="rounded-lg border border-blue-900/20 bg-[#0d1a30] p-3">
          <p className="text-xs text-blue-400">Amount</p>
          <p className="text-lg font-bold text-white">&#8377;{(booking.agreed_amount as number).toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-lg border border-blue-900/20 bg-[#0d1a30] p-3">
          <p className="text-xs text-blue-400">Status</p>
          <p className="text-sm font-semibold text-white">{booking.status as string}</p>
        </div>
      </div>

      {canReview && (
        <ReviewForm bookingId={params.id} revieweeId={artist?.user_id as string} />
      )}
    </div>
  );
}
