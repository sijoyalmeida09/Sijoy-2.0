import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";
import { createTransfer } from "@/lib/razorpay";
import { awardPoints } from "@/lib/points";

const schema = z.object({
  bookingId: z.string().uuid()
});

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const admin = createAdminSupabaseClient();

  const { data: booking } = await admin
    .from("event_bookings")
    .select("id, status, escrow_status, payout_status, razorpay_payment_id, artist_payout, platform_revenue, artist_id")
    .eq("id", parsed.data.bookingId)
    .maybeSingle();

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  if ((booking.status as string) !== "completed") {
    return NextResponse.json({ error: "Booking must be completed before payout" }, { status: 400 });
  }
  if ((booking.payout_status as string) === "settled") {
    return NextResponse.json({ error: "Already settled" }, { status: 400 });
  }

  const { data: artistProfile } = await admin
    .from("artist_profiles")
    .select("user_id, metadata")
    .eq("id", booking.artist_id)
    .maybeSingle();

  if (!artistProfile) return NextResponse.json({ error: "Artist not found" }, { status: 404 });

  const artistMetadata = (artistProfile.metadata as Record<string, unknown>) ?? {};
  const razorpayAccountId = artistMetadata.razorpay_account_id as string | undefined;

  if (razorpayAccountId && booking.razorpay_payment_id) {
    try {
      await createTransfer({
        paymentId: booking.razorpay_payment_id as string,
        artistAccountId: razorpayAccountId,
        amount: booking.artist_payout as number,
        notes: { booking_id: booking.id as string }
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transfer failed";
      await admin
        .from("event_bookings")
        .update({ payout_status: "failed" })
        .eq("id", booking.id);
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  await admin
    .from("event_bookings")
    .update({
      payout_status: "settled",
      payout_settled_at: new Date().toISOString(),
      escrow_status: "released"
    })
    .eq("id", booking.id);

  await admin.from("revenue_entries").insert({
    amount: booking.platform_revenue,
    business_line: "music",
    source_domain: "music.joshoit.com"
  });

  await awardPoints({
    userId: artistProfile.user_id as string,
    points: 50,
    reason: "Gig completed and paid out",
    sourceDomain: "music.joshoit.com",
    referenceId: booking.id as string
  });

  return NextResponse.json({ ok: true, payoutStatus: "settled" });
}
