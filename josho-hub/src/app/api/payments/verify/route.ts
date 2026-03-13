import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";
import { verifyPaymentSignature } from "@/lib/razorpay";

const schema = z.object({
  bookingId: z.string().uuid(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string()
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

  const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  const valid = verifyPaymentSignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature
  });

  if (!valid) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();

  const { data: booking } = await admin
    .from("event_bookings")
    .select("id, organizer_id, agreed_amount, status")
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if ((booking.organizer_id as string) !== user.id) {
    return NextResponse.json({ error: "Not your booking" }, { status: 403 });
  }

  const depositAmount = Math.round((booking.agreed_amount as number) * 0.2 * 100) / 100;

  const { error } = await admin
    .from("event_bookings")
    .update({
      status: "confirmed",
      escrow_status: "deposit_held",
      deposit_amount: depositAmount,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId
    })
    .eq("id", bookingId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, status: "confirmed" });
}
