import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({
  artistId: z.string().uuid(),
  status: z.enum(["verified", "rejected"]),
  rejectionReason: z.string().max(500).nullable().optional()
});

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { artistId, status, rejectionReason } = parsed.data;

  const { error } = await supabase
    .from("artist_profiles")
    .update({
      verification_status: status,
      rejection_reason: status === "rejected" ? (rejectionReason ?? null) : null
    })
    .eq("id", artistId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
