import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { VALID_BOOKING_TRANSITIONS, type BookingStatus } from "@/types/domain";

const schema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(["accepted", "confirmed", "completed", "cancelled", "disputed"]),
  cancellationReason: z.string().max(500).optional()
});

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { bookingId, status: newStatus, cancellationReason } = parsed.data;

  const { data: booking } = await supabase
    .from("event_bookings")
    .select("id, status, organizer_id, artist_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const currentStatus = booking.status as BookingStatus;
  const allowed = VALID_BOOKING_TRANSITIONS[currentStatus] ?? [];

  if (!allowed.includes(newStatus as BookingStatus)) {
    return NextResponse.json(
      { error: `Cannot transition from '${currentStatus}' to '${newStatus}'. Allowed: ${allowed.join(", ") || "none"}` },
      { status: 400 }
    );
  }

  if (newStatus === "confirmed") {
    return NextResponse.json(
      { error: "Use the payment flow to confirm a booking (deposit required)" },
      { status: 400 }
    );
  }

  const updatePayload: Record<string, unknown> = { status: newStatus };
  if (newStatus === "cancelled" && cancellationReason) {
    updatePayload.cancellation_reason = cancellationReason;
  }

  const { error } = await supabase
    .from("event_bookings")
    .update(updatePayload)
    .eq("id", bookingId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, from: currentStatus, to: newStatus });
}
