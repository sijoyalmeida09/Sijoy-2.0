import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email";

const schema = z.object({
  stageName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  city: z.string().max(100).default("Vasai-Virar"),
  bio: z.string().max(1000).optional(),
  eventRate: z.number().nullable().optional(),
  genres: z.array(z.string()).min(1),
  instruments: z.array(z.string()).min(1),
  profilePhoto: z.string().url().nullable().optional(),
  youtubeUrl: z.string().url().nullable().optional(),
  instagramHandle: z.string().max(50).nullable().optional(),
  mediaUrl: z.string().url().nullable().optional(),
  mediaType: z.enum(["youtube", "audio", "image"]).default("youtube")
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const {
      stageName, email, phone, city, bio, eventRate,
      genres, instruments, profilePhoto, youtubeUrl, instagramHandle, mediaUrl
    } = parsed.data;

    const supabase = createAdminSupabaseClient();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: stageName, phone: phone ?? null }
    });

    if (authError) {
      if (authError.message.includes("already been registered")) {
        return NextResponse.json({ error: "Email already registered. Please login instead." }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Update profile with role
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "musician", full_name: stageName })
      .eq("id", userId);

    if (profileError) {
      console.error("[ArtistRegister] Profile update failed:", profileError.message);
    }

    // 3. Format instagram URL
    let instagramUrl: string | null = null;
    if (instagramHandle) {
      const handle = instagramHandle.replace(/^@/, "");
      instagramUrl = `https://instagram.com/${handle}`;
    }

    // 4. Use youtube channel URL or mediaUrl
    const finalYoutubeUrl = youtubeUrl || (mediaUrl ?? null);

    // 5. Insert into artist_profiles table
    const { data: artist, error: artistError } = await supabase
      .from("artist_profiles")
      .insert({
        user_id: userId,
        stage_name: stageName,
        bio: bio ?? null,
        event_rate: eventRate ?? 2000,
        city: city,
        region: "Palghar",
        profile_photo: profilePhoto ?? null,
        youtube_url: finalYoutubeUrl,
        instagram_url: instagramUrl,
        available: true,
        verification_status: "pending",
        featured: false,
        search_rank: 0,
        total_bookings: 0,
        avg_rating: 0
      })
      .select("id")
      .single();

    if (artistError) {
      console.error("[ArtistRegister] Artist profile insert failed:", artistError.message);
      return NextResponse.json({ error: artistError.message }, { status: 400 });
    }

    const artistId = artist.id;

    // 6. Link genres
    const { data: genreRecords } = await supabase
      .from("genres")
      .select("id, slug")
      .in("slug", genres.map(g => g.toLowerCase()));

    if (genreRecords && genreRecords.length > 0) {
      const genreLinks = genreRecords.map(g => ({ artist_id: artistId, genre_id: g.id }));
      await supabase.from("artist_genres").insert(genreLinks);
    }

    // 7. Link instruments
    const { data: instrumentRecords } = await supabase
      .from("instruments")
      .select("id, slug")
      .in("slug", instruments.map(i => i.toLowerCase()));

    if (instrumentRecords && instrumentRecords.length > 0) {
      const instrumentLinks = instrumentRecords.map(i => ({ artist_id: artistId, instrument_id: i.id }));
      await supabase.from("artist_instruments").insert(instrumentLinks);
    }

    // 8. Send welcome email (non-blocking)
    sendWelcomeEmail({ to: email, fullName: stageName }).catch(() => {});

    return NextResponse.json({ ok: true, artistId });
  } catch (err) {
    console.error("[ArtistRegister] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
