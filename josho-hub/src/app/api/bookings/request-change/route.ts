import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  bookingId: z.string().uuid(),
  type: z.enum(["reschedule", "cancel"]),
  reason: z.string().min(5).max(500)
});

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "musician" && profile.role !== "admin")) {
    return NextResponse.json({ error: "Only musicians/admin can create requests." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { bookingId, type, reason } = parsed.data;
  const { error } = await supabase.from("schedule_change_requests").insert({
    booking_id: bookingId,
    requester_id: user.id,
    request_type: type,
    reason,
    status: "pending"
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
