import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event as string;

  if (event === "payment.captured") {
    const payment = payload.payload?.payment?.entity;
    if (!payment) return NextResponse.json({ ok: true });

    const orderId = payment.order_id as string;
    const paymentId = payment.id as string;

    const admin = createAdminSupabaseClient();

    const { data: booking } = await admin
      .from("event_bookings")
      .select("id, escrow_status, razorpay_payment_id")
      .eq("razorpay_order_id", orderId)
      .maybeSingle();

    if (!booking) return NextResponse.json({ ok: true, note: "No matching booking" });

    if (booking.razorpay_payment_id === paymentId) {
      return NextResponse.json({ ok: true, note: "Already processed" });
    }

    const depositAmount = (payment.amount as number) / 100;

    await admin
      .from("event_bookings")
      .update({
        status: "confirmed",
        escrow_status: "deposit_held",
        deposit_amount: depositAmount,
        razorpay_payment_id: paymentId
      })
      .eq("id", booking.id);
  }

  return NextResponse.json({ ok: true });
}
