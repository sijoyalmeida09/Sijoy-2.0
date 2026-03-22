import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createOrder, getRazorpayKeyId } from "@/lib/razorpay";

const DEPOSIT_PCT = 0.2;

const schema = z.object({
  bookingId: z.string().uuid()
});

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data: booking } = await supabase
    .from("event_bookings")
    .select("id, agreed_amount, status, escrow_status, organizer_id")
    .eq("id", parsed.data.bookingId)
    .maybeSingle();

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if ((booking.organizer_id as string) !== user.id) {
    return NextResponse.json({ error: "Not your booking" }, { status: 403 });
  }
  if ((booking.status as string) !== "accepted") {
    return NextResponse.json({ error: "Booking must be in 'accepted' state to pay deposit" }, { status: 400 });
  }
  if ((booking.escrow_status as string) !== "awaiting_deposit") {
    return NextResponse.json({ error: "Deposit already initiated" }, { status: 400 });
  }

  const depositAmount = Math.round((booking.agreed_amount as number) * DEPOSIT_PCT * 100) / 100;

  const order = await createOrder({
    amount: depositAmount,
    receipt: `booking_${booking.id}`,
    notes: {
      booking_id: booking.id as string,
      type: "deposit"
    }
  });

  return NextResponse.json({
    orderId: order.id,
    amount: depositAmount,
    currency: "INR",
    keyId: getRazorpayKeyId(),
    bookingId: booking.id
  });
}
