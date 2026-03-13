import { requireProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminView } from "@/components/dashboard/views/admin-view";
import { MusicianView } from "@/components/dashboard/views/musician-view";
import { ClientView } from "@/components/dashboard/views/client-view";

async function getAdminMetrics() {
  const supabase = createServerSupabaseClient();
  const [{ count: activeUsers }, { data: revenueRows }, { count: highTickets }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("revenue_entries").select("amount"),
    supabase
      .from("it_tickets")
      .select("id", { count: "exact", head: true })
      .eq("priority", "high")
      .in("status", ["open", "in_progress"])
  ]);

  const totalRevenue = (revenueRows ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  return { activeUsers: activeUsers ?? 0, totalRevenue, highTickets: highTickets ?? 0 };
}

async function getMusicianData(userId: string) {
  const supabase = createServerSupabaseClient();

  const [{ data: bookingRows }, { data: profile }] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, event_name, event_date, status, payment_forwarding_status")
      .eq("musician_id", userId)
      .order("event_date", { ascending: true })
      .limit(5),
    supabase.from("profiles").select("metadata").eq("id", userId).maybeSingle()
  ]);

  const feed = ((profile?.metadata as Record<string, unknown> | null)?.music_feed as string[] | undefined) ?? [];
  return { feed, bookings: bookingRows ?? [] };
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
    const metrics = await getAdminMetrics();
    return (
      <AdminView
        profileName={profile.full_name ?? "Admin"}
        totalRevenue={metrics.totalRevenue}
        activeUsers={metrics.activeUsers}
        highPriorityTickets={metrics.highTickets}
      />
    );
  }

  if (profile.role === "musician") {
    const data = await getMusicianData(profile.id);
    return <MusicianView feed={data.feed} bookings={data.bookings} />;
  }

  const clientData = await getClientData(profile.id);
  return <ClientView itProjectStatus={clientData.itProjectStatus} savedListings={clientData.savedListings} />;
}
