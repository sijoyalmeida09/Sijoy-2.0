// Cash confirmation route — artist marks cash received after gig.
// Updates booking to completed + credits artist wallet. No gateway needed.
import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({
  bookingId:       z.string().uuid(),
  cashReceivedInr: z.number().int().positive(),
  tipInr:          z.number().int().min(0).default(0),
});

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { bookingId, cashReceivedInr, tipInr } = parsed.data;

  // Verify this booking belongs to this artist
  const { data: artistProfile } = await supabase
    .from("artist_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!artistProfile) return NextResponse.json({ error: "Artist profile not found" }, { status: 403 });

  const { data: booking } = await supabase
    .from("event_bookings")
    .select("id, status, artist_id, agreed_amount, platform_fee_pct, artist_payout")
    .eq("id", bookingId)
    .eq("artist_id", artistProfile.id)
    .maybeSingle();

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (!["accepted", "confirmed"].includes(booking.status)) {
    return NextResponse.json(
      { error: `Cannot confirm cash for booking with status '${booking.status}'` },
      { status: 400 }
    );
  }

  const platformFeeInr = Math.round(cashReceivedInr * (booking.platform_fee_pct / 100));
  const netInr         = cashReceivedInr - platformFeeInr + tipInr;

  // Mark booking as completed
  const { error: bookingError } = await supabase
    .from("event_bookings")
    .update({
      status:         "completed",
      payout_status:  "settled",
      metadata: {
        payment_method:   "cash",
        cash_received_inr: cashReceivedInr,
        tip_inr:           tipInr,
        confirmed_at:      new Date().toISOString(),
      }
    })
    .eq("id", bookingId);

  if (bookingError) return NextResponse.json({ error: bookingError.message }, { status: 400 });

  // Upsert artist wallet
  const { data: existing } = await supabase
    .from("artist_wallets")
    .select("id, balance_inr, total_earned_inr, total_fees_paid_inr, total_tips_inr")
    .eq("provider_id", artistProfile.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("artist_wallets")
      .update({
        balance_inr:          existing.balance_inr + netInr,
        total_earned_inr:     existing.total_earned_inr + cashReceivedInr,
        total_fees_paid_inr:  existing.total_fees_paid_inr + platformFeeInr,
        total_tips_inr:       existing.total_tips_inr + tipInr,
        last_transaction_at:  new Date().toISOString(),
      })
      .eq("id", existing.id);

    // Append ledger rows
    await supabase.from("wallet_transactions").insert([
      { wallet_id: existing.id, tx_type: "booking_earning", amount_inr: cashReceivedInr,  balance_after: existing.balance_inr + cashReceivedInr,                  note: "Cash received for gig" },
      { wallet_id: existing.id, tx_type: "platform_fee",    amount_inr: -platformFeeInr,  balance_after: existing.balance_inr + cashReceivedInr - platformFeeInr,  note: `Platform fee ${booking.platform_fee_pct}%` },
      ...(tipInr > 0 ? [{
        wallet_id:     existing.id,
        tx_type:       "tip_credit" as const,
        amount_inr:    tipInr,
        balance_after: existing.balance_inr + netInr,
        note:          "Tip from client",
      }] : []),
    ]);
  } else {
    // First booking — create wallet
    const { data: newWallet } = await supabase
      .from("artist_wallets")
      .insert({
        provider_id:          artistProfile.id,
        balance_inr:          netInr,
        total_earned_inr:     cashReceivedInr,
        total_fees_paid_inr:  platformFeeInr,
        total_tips_inr:       tipInr,
        last_transaction_at:  new Date().toISOString(),
      })
      .select("id")
      .single();

    if (newWallet) {
      await supabase.from("wallet_transactions").insert([
        { wallet_id: newWallet.id, tx_type: "booking_earning", amount_inr: cashReceivedInr,  balance_after: cashReceivedInr,                  note: "Cash received for gig" },
        { wallet_id: newWallet.id, tx_type: "platform_fee",    amount_inr: -platformFeeInr,  balance_after: cashReceivedInr - platformFeeInr,  note: `Platform fee ${booking.platform_fee_pct}%` },
        ...(tipInr > 0 ? [{
          wallet_id:     newWallet.id,
          tx_type:       "tip_credit" as const,
          amount_inr:    tipInr,
          balance_after: netInr,
          note:          "Tip from client",
        }] : []),
      ]);
    }
  }

  return NextResponse.json({
    ok: true,
    booking_id:       bookingId,
    cash_received:    cashReceivedInr,
    platform_fee:     platformFeeInr,
    tip:              tipInr,
    net_credited:     netInr,
  });
}
