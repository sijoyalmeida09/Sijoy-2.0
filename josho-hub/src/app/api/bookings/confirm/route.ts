import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { awardPoints } from "@/lib/points";

const payloadSchema = z.object({
  bookingId: z.string().uuid()
});

export async function POST(request: Request) {
  const authHeader = request.headers.get("x-booking-secret");
  const expected = process.env.BOOKING_CONFIRM_WEBHOOK_SECRET;
  if (!expected || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  const { bookingId } = parsed.data;

  const { data: booking } = await supabase
    .from("event_bookings")
    .select("artist_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const { data: artistRow } = await supabase
    .from("artist_profiles")
    .select("user_id")
    .eq("id", (booking as { artist_id: string }).artist_id)
    .maybeSingle();

  const userId = (artistRow as { user_id: string } | null)?.user_id;
  if (!userId) return NextResponse.json({ error: "Artist not found" }, { status: 404 });

  const { error } = await supabase.from("event_bookings").update({ status: "confirmed" }).eq("id", bookingId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await awardPoints({
    userId,
    points: 50,
    reason: "Booking confirmed",
    sourceDomain: "music.joshoit.com",
    referenceId: bookingId
  });

  return NextResponse.json({ ok: true, awardedPoints: 50 });
}
