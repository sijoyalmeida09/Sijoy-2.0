import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({
  artistId: z.string().uuid(),
  bandMemberIds: z.array(z.string().uuid()).default([]),
  eventName: z.string().min(2).max(200),
  eventType: z.string().min(2).max(50),
  eventDate: z.string(),
  venue: z.string().max(300).optional(),
  description: z.string().max(2000).optional(),
  agreedAmount: z.number().min(1),
  // Guest checkout fields (used when not logged in)
  guestName: z.string().max(100).optional(),
  guestEmail: z.string().email().optional().or(z.literal("")),
  guestPhone: z.string().max(20).optional(),
});

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { artistId, eventName, eventType, eventDate, venue, description, agreedAmount,
          guestName, guestEmail, guestPhone } = parsed.data;

  // Require either a logged-in user OR guest contact details
  if (!user && !guestName) {
    return NextResponse.json({ error: "Please provide your name to continue" }, { status: 400 });
  }

  const { data: artist } = await supabase
    .from("artist_profiles")
    .select("id, commission_pct, city, is_online, online_city")
    .eq("id", artistId)
    .maybeSingle();

  if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 });

  const commissionPct = (artist.commission_pct as number) ?? 10;
  const platformRevenue = Math.round(agreedAmount * (commissionPct / 100));
  const artistPayout = agreedAmount - platformRevenue;

  const { data: booking, error } = await supabase
    .from("event_bookings")
    .insert({
      organizer_id: user?.id ?? null,
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
      status: "requested",
      // Store guest contact info in metadata for artist to reach them
      metadata: user ? {} : {
        guest: true,
        guest_name: guestName,
        guest_email: guestEmail || null,
        guest_phone: guestPhone || null,
      }
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // If artist is currently online, broadcast instant gig request to their city channel
  if (artist.is_online) {
    try {
      const artistCity = (artist.online_city || artist.city) as string;

      // Get organizer's name for the notification
      const { data: organizer } = user ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle() : { data: null };

      const admin = createAdminSupabaseClient();
      const channel = admin.channel(`gig-requests:${artistCity}`);
      await channel.send({
        type: "broadcast",
        event: "new-gig",
        payload: {
          gigId: booking.id,
          eventType: eventType,
          venue: venue ?? "Venue TBD",
          city: artistCity,
          amount: artistPayout,
          eventDate: eventDate,
          clientName: (organizer?.full_name as string) || "Client",
        },
      });
    } catch (broadcastErr) {
      // Non-fatal: booking is created, real-time notify failed
      console.error("[BookingCreate] broadcast failed:", broadcastErr);
    }
  }

  return NextResponse.json({ ok: true, bookingId: booking.id });
}
