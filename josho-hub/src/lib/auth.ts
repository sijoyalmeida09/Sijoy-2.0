import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile, Role } from "@/types/domain";

const FALLBACK_ROLE: Role = "user";

export async function getCurrentSessionUser() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

export async function getCurrentProfile() {
  const user = await getCurrentSessionUser();
  if (!user?.id) return null;

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, loyalty_points, metadata")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    const fallback: Profile = {
      id: user.id,
      full_name: user.user_metadata?.full_name ?? null,
      email: user.email ?? "",
      role: FALLBACK_ROLE,
      loyalty_points: 0,
      metadata: null
    };
    return fallback;
  }

  return data as Profile;
}

export async function requireProfile() {
  const user = await getCurrentSessionUser();
  if (!user) redirect("/login");

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}
