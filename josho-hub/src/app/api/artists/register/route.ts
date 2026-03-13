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
  mediaUrl: z.string().url().nullable().optional(),
  mediaType: z.enum(["youtube", "audio", "image"]).default("youtube")
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { stageName, email, phone, city, bio, eventRate, genres, instruments, mediaUrl, mediaType } = parsed.data;
  const supabase = createAdminSupabaseClient();

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

  await supabase.from("profiles").update({ role: "musician", full_name: stageName }).eq("id", userId);

  const { data: artistProfile, error: artistError } = await supabase
    .from("artist_profiles")
    .insert({
      user_id: userId,
      stage_name: stageName,
      bio: bio ?? null,
      event_rate: eventRate ?? null,
      city,
      onboarded_via: "join_page"
    })
    .select("id")
    .single();

  if (artistError) return NextResponse.json({ error: artistError.message }, { status: 400 });

  const artistId = artistProfile.id;

  if (genres.length > 0) {
    const { data: genreRows } = await supabase.from("genres").select("id, slug").in("slug", genres);
    if (genreRows && genreRows.length > 0) {
      await supabase.from("artist_genres").insert(
        genreRows.map((g: { id: number }) => ({ artist_id: artistId, genre_id: g.id }))
      );
    }
  }

  if (instruments.length > 0) {
    const { data: instrumentRows } = await supabase.from("instruments").select("id, slug").in("slug", instruments);
    if (instrumentRows && instrumentRows.length > 0) {
      await supabase.from("artist_instruments").insert(
        instrumentRows.map((i: { id: number }) => ({ artist_id: artistId, instrument_id: i.id }))
      );
    }
  }

  if (mediaUrl) {
    await supabase.from("artist_media").insert({
      artist_id: artistId,
      media_type: mediaType,
      url: mediaUrl,
      sort_order: 0
    });
  }

  await sendWelcomeEmail({ to: email, fullName: stageName });

  return NextResponse.json({ ok: true, artistId });
}
