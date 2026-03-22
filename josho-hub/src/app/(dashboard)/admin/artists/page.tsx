import { requireProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminArtistActions } from "./admin-artist-actions";

export default async function AdminArtistsPage() {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/dashboard");

  const supabase = createServerSupabaseClient();

  const { data: pending } = await supabase
    .from("artist_profiles")
    .select("id, stage_name, city, bio, event_rate, profile_photo, created_at, verification_status, user_id, profiles!artist_profiles_user_id_fkey(email)")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true });

  const { data: recent } = await supabase
    .from("artist_profiles")
    .select("id, stage_name, city, verification_status, created_at")
    .in("verification_status", ["verified", "rejected"])
    .order("updated_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Artist Verification</h2>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-400">
          Pending Review ({(pending ?? []).length})
        </h3>
        {(pending ?? []).length === 0 ? (
          <p className="text-sm text-blue-300">No artists pending review.</p>
        ) : (
          <div className="space-y-3">
            {(pending ?? []).map((a: Record<string, unknown>) => {
              const userProfile = a.profiles as { email: string } | null;
              return (
                <div key={a.id as string} className="rounded-xl border border-amber-800/30 bg-[#1a2210] p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 overflow-hidden rounded-lg bg-[#0d1a30]">
                      {(a.profile_photo as string | null) ? (
                        <img src={a.profile_photo as string} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xl text-blue-600">
                          {(a.stage_name as string).charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{a.stage_name as string}</p>
                      <p className="text-xs text-blue-300">
                        {a.city as string} &middot; {userProfile?.email ?? "no email"} &middot; {String(a.created_at).slice(0, 10)}
                      </p>
                      {(a.bio as string | null) && (
                        <p className="mt-1 text-sm text-blue-100">{(a.bio as string).slice(0, 200)}</p>
                      )}
                      {(a.event_rate as number | null) && (
                        <p className="mt-1 text-xs text-blue-200">Rate: &#8377;{(a.event_rate as number).toLocaleString("en-IN")}</p>
                      )}
                    </div>
                  </div>
                  <AdminArtistActions artistId={a.id as string} />
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-400">
          Recently Reviewed ({(recent ?? []).length})
        </h3>
        <div className="space-y-2">
          {(recent ?? []).map((a: Record<string, unknown>) => (
            <div key={a.id as string} className="flex items-center justify-between rounded-lg border border-blue-900/20 bg-[#0d1a30] p-3">
              <div>
                <p className="text-sm font-medium text-white">{a.stage_name as string}</p>
                <p className="text-xs text-blue-400">{a.city as string} &middot; {String(a.created_at).slice(0, 10)}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                a.verification_status === "verified" ? "bg-green-600/20 text-green-300" : "bg-red-600/20 text-red-300"
              }`}>
                {a.verification_status as string}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
