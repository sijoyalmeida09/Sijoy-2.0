import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

// DELETE THIS FILE AFTER SEEDING - one-time use only
// Run by visiting: https://sohaya.joshoit.com/api/seed?key=sohaya2026

const SEED_KEY = "sohaya2026";

const SEED_USERS = [
  {
    email: "admin@sohaya.in",
    password: "SohayaAdmin2026!",
    role: "admin",
    full_name: "Sijoy Admin"
  },
  {
    email: "artist@sohaya.in",
    password: "SohayaArtist2026!",
    role: "musician",
    full_name: "Test Artist",
    provider: {
      display_name: "DJ TestBeats",
      bio: "Professional DJ for weddings and parties in Vasai-Virar. 5+ years experience.",
      instruments: ["dj", "keyboard"],
      specialties: ["bollywood", "edm", "western"],
      base_rate_inr: 5000,
      region: "vasai",
      city: "Vasai",
      youtube_url: "https://youtube.com/@djtest",
      instagram_url: "https://instagram.com/djtestbeats",
      status: "verified"
    }
  },
  {
    email: "client@sohaya.in",
    password: "SohayaClient2026!",
    role: "client",
    full_name: "Test Client"
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key !== SEED_KEY) {
    return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  const results: Array<{ email: string; status: string; error?: string }> = [];

  for (const user of SEED_USERS) {
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", user.email)
        .limit(1);

      if (existingUsers && existingUsers.length > 0) {
        results.push({ email: user.email, status: "already exists" });
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.full_name }
      });

      if (authError) {
        results.push({ email: user.email, status: "auth failed", error: authError.message });
        continue;
      }

      const userId = authData.user.id;

      // Update profile with role
      await supabase
        .from("profiles")
        .update({ role: user.role, full_name: user.full_name })
        .eq("id", userId);

      // If musician, create provider record
      if (user.role === "musician" && user.provider) {
        const { error: providerError } = await supabase.from("providers").insert({
          profile_id: userId,
          provider_type: "musician",
          display_name: user.provider.display_name,
          bio: user.provider.bio,
          instruments: user.provider.instruments,
          specialties: user.provider.specialties,
          base_rate_inr: user.provider.base_rate_inr,
          region: user.provider.region,
          city: user.provider.city,
          youtube_url: user.provider.youtube_url,
          instagram_url: user.provider.instagram_url,
          status: user.provider.status,
          is_online: true
        });

        if (providerError) {
          results.push({ email: user.email, status: "provider failed", error: providerError.message });
          continue;
        }
      }

      results.push({ email: user.email, status: "created" });
    } catch (err) {
      results.push({
        email: user.email,
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error"
      });
    }
  }

  return NextResponse.json({
    success: true,
    results,
    credentials: SEED_USERS.map(u => ({
      email: u.email,
      password: u.password,
      role: u.role
    }))
  });
}
