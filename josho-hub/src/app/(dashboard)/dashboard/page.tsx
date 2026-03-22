import { requireProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminView } from "@/components/dashboard/views/admin-view";
import { MusicianView } from "@/components/dashboard/views/musician-view";
import { ClientView } from "@/components/dashboard/views/client-view";

async function getAdminMetrics() {
  const supabase = createServerSupabaseClient();

  const [
    { count: activeUsers },
    { count: totalArtists },
    { count: pendingVerifications },
    { count: onlineArtists },
    { data: allBookings },
    { data: recentArtists },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("artist_profiles").select("id", { count: "exact", head: true }),
    supabase.from("artist_profiles").select("id", { count: "exact", head: true }).eq("verification_status", "pending"),
    supabase.from("artist_profiles").select("id", { count: "exact", head: true }).eq("is_online", true),
    supabase
      .from("event_bookings")
      .select("id, event_name, event_date, status, agreed_amount, artist_payout, platform_revenue, escrow_status, artist_id, organizer_id, artist_profiles(stage_name), profiles!event_bookings_organizer_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("artist_profiles")
      .select("id, stage_name, city, verification_status, total_bookings, avg_rating, is_online")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const bookings = (allBookings ?? []).map((b: Record<string, unknown>) => ({
    id: b.id as string,
    event_name: (b.event_name as string) || "Untitled",
    event_date: b.event_date as string,
    status: b.status as string,
    agreed_amount: (b.agreed_amount as number) || 0,
    artist_payout: (b.artist_payout as number) || 0,
    platform_revenue: (b.platform_revenue as number) || 0,
    escrow_status: b.escrow_status as string | null,
    artist_name: (b.artist_profiles as { stage_name: string } | null)?.stage_name || null,
    organizer_name: (b.profiles as { full_name: string } | null)?.full_name || null,
  }));

  const gmvTotal = bookings.reduce((s, b) => s + b.agreed_amount, 0);
  const commissionTotal = bookings.reduce((s, b) => s + b.platform_revenue, 0);
  const bookingsByStatus: Record<string, number> = {};
  bookings.forEach((b) => { bookingsByStatus[b.status] = (bookingsByStatus[b.status] || 0) + 1; });

  const artists = (recentArtists ?? []).map((a: Record<string, unknown>) => ({
    id: a.id as string,
    stage_name: a.stage_name as string,
    city: (a.city as string) || "Unknown",
    verification_status: (a.verification_status as string) || "pending",
    total_bookings: (a.total_bookings as number) || 0,
    avg_rating: (a.avg_rating as number) || 0,
    is_online: (a.is_online as boolean) || false,
  }));

  return {
    activeUsers: activeUsers ?? 0,
    totalArtists: totalArtists ?? 0,
    pendingVerifications: pendingVerifications ?? 0,
    onlineArtists: onlineArtists ?? 0,
    bookings,
    recentArtists: artists,
    gmvTotal,
    commissionTotal,
    bookingsByStatus,
  };
}

async function getMusicianData(userId: string) {
  const supabase = createServerSupabaseClient();

  const { data: artist } = await supabase
    .from("artist_profiles")
    .select("id, city, is_online")
    .eq("user_id", userId)
    .maybeSingle();

  if (!artist) {
    return { feed: [], bookings: [], artistId: null, city: "", isOnline: false };
  }

  const [{ data: bookingRows }, { data: profile }] = await Promise.all([
    supabase
      .from("event_bookings")
      .select("id, event_name, event_date, status, payout_status")
      .eq("artist_id", artist.id)
      .order("event_date", { ascending: true })
      .limit(5),
    supabase.from("profiles").select("metadata").eq("id", userId).maybeSingle()
  ]);

  const feed = ((profile?.metadata as Record<string, unknown> | null)?.music_feed as string[] | undefined) ?? [];
  const bookings = (bookingRows ?? []).map((b: Record<string, unknown>) => ({
    id: b.id as string,
    event_name: b.event_name as string,
    event_date: b.event_date as string,
    status: b.status as string,
    payment_forwarding_status: (b.payout_status ?? "pending") as string
  }));
  return {
    feed,
    bookings,
    artistId: artist.id as string,
    city: (artist.city as string) || "Vasai",
    isOnline: (artist.is_online as boolean) || false
  };
}

async function getClientData(userId: string) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from("profiles").select("metadata").eq("id", userId).maybeSingle();
  const metadata = (data?.metadata as Record<string, unknown> | null) ?? {};

  return {
    itProjectStatus: String(metadata.it_project_status ?? "No active IT project"),
    savedListings: (metadata.saved_listings as string[] | undefined) ?? []
  };
}

export default async function DashboardPage() {
  const profile = await requireProfile();

  if (profile.role === "admin") {
    const m = await getAdminMetrics();
    return (
      <AdminView
        profileName={profile.full_name ?? "Admin"}
        totalRevenue={m.gmvTotal}
        activeUsers={m.activeUsers}
        totalArtists={m.totalArtists}
        pendingVerifications={m.pendingVerifications}
        onlineArtists={m.onlineArtists}
        bookings={m.bookings}
        recentArtists={m.recentArtists}
        gmvTotal={m.gmvTotal}
        commissionTotal={m.commissionTotal}
        bookingsByStatus={m.bookingsByStatus}
      />
    );
  }

  if (profile.role === "musician") {
    const data = await getMusicianData(profile.id);
    return (
      <MusicianView
        feed={data.feed}
        bookings={data.bookings}
        artistId={data.artistId}
        city={data.city}
        isOnline={data.isOnline}
      />
    );
  }

  const clientData = await getClientData(profile.id);
  return <ClientView itProjectStatus={clientData.itProjectStatus} savedListings={clientData.savedListings} />;
}
