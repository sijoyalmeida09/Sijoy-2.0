import { NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { online, city } = await request.json();

    // Get artist profile for this user
    const { data: artist, error: fetchError } = await supabase
      .from("artist_profiles")
      .select("id, city, verification_status")
      .eq("user_id", user.id)
      .single();

    if (fetchError || !artist) {
      return NextResponse.json({ error: "Artist profile not found" }, { status: 404 });
    }

    if (artist.verification_status !== "verified") {
      return NextResponse.json({ error: "Only verified artists can go live" }, { status: 403 });
    }

    const admin = createAdminSupabaseClient();

    // Update online status
    const { error: updateError } = await admin
      .from("artist_profiles")
      .update({
        is_online: online,
        went_online_at: online ? new Date().toISOString() : null,
        online_city: online ? (city || artist.city) : null,
        available: online ? true : undefined,
      })
      .eq("id", artist.id);

    if (updateError) throw updateError;

    // Broadcast presence to the city channel
    const channel = admin.channel(`city-presence:${city || artist.city}`);
    await channel.send({
      type: "broadcast",
      event: online ? "artist-online" : "artist-offline",
      payload: { artistId: artist.id, city: city || artist.city },
    });

    return NextResponse.json({ ok: true, is_online: online });
  } catch (err) {
    console.error("[GoLive]", err);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
