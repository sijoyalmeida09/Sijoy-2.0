import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function awardPoints(input: {
  userId: string;
  points: number;
  reason: string;
  sourceDomain?: string | null;
  referenceId?: string | null;
}) {
  const supabase = createAdminSupabaseClient();

  const { error: profileError } = await supabase.rpc("increment_loyalty_points", {
    target_user_id: input.userId,
    delta: input.points
  });

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { error: txError } = await supabase.from("loyalty_point_transactions").insert({
    user_id: input.userId,
    points_delta: input.points,
    reason: input.reason,
    source_domain: input.sourceDomain ?? null,
    reference_id: input.referenceId ?? null
  });

  if (txError) {
    throw new Error(txError.message);
  }
}
