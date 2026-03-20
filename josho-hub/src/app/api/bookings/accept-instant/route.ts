import { NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { gigId, artistId } = await request.json();
    if (!gigId || !artistId) return NextResponse.json({ error: "Missing params" }, { status: 400 });

    const admin = createAdminSupabaseClient();

    // Verify artist belongs to user
    const { data: artist } = await admin
      .from("artist_profiles")
      .select("id, city")
      .eq("id", artistId)
      .eq("user_id", user.id)
      .single();

    if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 });

    // Atomically accept: only succeeds if booking is still "requested"
    const { data: booking, error } = await admin
      .from("event_bookings")
      .update({ artist_id: artistId, status: "accepted" })
      .eq("id", gigId)
      .eq("status", "requested")
      .is("artist_id", null)
      .select("id, event_type, city, agreed_amount")
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: "Gig no longer available" }, { status: 409 });
    }

    // Broadcast to city channel: gig taken (so other musicians dismiss it)
    const channel = admin.channel(`gig-requests:${booking.city}`);
    await channel.send({
      type: "broadcast",
      event: "gig-taken",
      payload: { gigId, byArtistId: artistId },
    });

    return NextResponse.json({ ok: true, bookingId: booking.id });
  } catch (err) {
    console.error("[AcceptInstant]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
