import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({
  artistId: z.string().uuid(),
  bandMemberIds: z.array(z.string().uuid()).default([]),
  eventName: z.string().min(2).max(200),
  eventType: z.string().min(2).max(50),
  eventDate: z.string(),
  venue: z.string().max(300).optional(),
  description: z.string().max(2000).optional(),
  agreedAmount: z.number().min(1)
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

  const { artistId, eventName, eventType, eventDate, venue, description, agreedAmount } = parsed.data;

  const { data: artist } = await supabase
    .from("artist_profiles")
    .select("id, commission_pct")
    .eq("id", artistId)
    .maybeSingle();

  if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 });

  const commissionPct = (artist.commission_pct as number) ?? 10;
  const platformRevenue = Math.round(agreedAmount * (commissionPct / 100));
  const artistPayout = agreedAmount - platformRevenue;

  const { data: booking, error } = await supabase
    .from("event_bookings")
    .insert({
      organizer_id: user.id,
      artist_id: artistId,
      event_name: eventName,
      event_type: eventType,
      event_date: eventDate,
      venue: venue ?? null,
      description: description ?? null,
      agreed_amount: agreedAmount,
      platform_fee_pct: commissionPct,
      artist_payout: artistPayout,
      platform_revenue: platformRevenue,
      status: "requested"
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, bookingId: booking.id });
}
