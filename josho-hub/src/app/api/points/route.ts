import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { awardPoints } from "@/lib/points";

const pointSchema = z.object({
  userId: z.string().uuid(),
  points: z.number().int().min(1).max(10000),
  reason: z.string().min(3).max(200),
  sourceDomain: z.string().optional(),
  referenceId: z.string().optional()
});

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin only endpoint" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = pointSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await awardPoints(parsed.data);
  return NextResponse.json({ ok: true });
}
