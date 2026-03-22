import Link from "next/link";

interface Booking {
  id: string;
  event_name: string;
  event_date: string;
  status: string;
  agreed_amount: number;
  artist_payout: number;
  platform_revenue: number;
  escrow_status: string | null;
  artist_name: string | null;
  organizer_name: string | null;
}

interface ArtistSummary {
  id: string;
  stage_name: string;
  city: string;
  verification_status: string;
  total_bookings: number;
  avg_rating: number;
  is_online: boolean;
}

interface AdminViewProps {
  profileName: string;
  totalRevenue: number;
  activeUsers: number;
  totalArtists: number;
  pendingVerifications: number;
  onlineArtists: number;
  bookings: Booking[];
  recentArtists: ArtistSummary[];
  gmvTotal: number;
  commissionTotal: number;
  bookingsByStatus: Record<string, number>;
}

const STATUS_COLORS: Record<string, string> = {
  requested: "bg-amber-500/20 text-amber-300",
  accepted: "bg-blue-500/20 text-blue-300",
  confirmed: "bg-green-500/20 text-green-300",
  completed: "bg-emerald-500/20 text-emerald-300",
  cancelled: "bg-red-500/20 text-red-400",
  disputed: "bg-orange-500/20 text-orange-300",
};

export function AdminView({
  profileName,
  totalRevenue,
  activeUsers,
  totalArtists,
  pendingVerifications,
  onlineArtists,
  bookings,
  recentArtists,
  gmvTotal,
  commissionTotal,
  bookingsByStatus,
}: AdminViewProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Admin Dashboard</h2>
        <span className="text-xs text-blue-400">Welcome, {profileName}</span>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-emerald-800/40 bg-[#0d2818] p-4">
          <p className="text-xs text-emerald-300">Total GMV</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {"\u20B9"}{gmvTotal.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-xl border border-amber-800/40 bg-[#2a1f0d] p-4">
          <p className="text-xs text-amber-300">Platform Commission</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {"\u20B9"}{commissionTotal.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-xl border border-blue-800/40 bg-[#162746] p-4">
          <p className="text-xs text-blue-300">Total Users</p>
          <p className="mt-1 text-2xl font-bold text-white">{activeUsers}</p>
        </div>
        <div className="rounded-xl border border-blue-800/40 bg-[#162746] p-4">
          <p className="text-xs text-blue-300">Artists ({onlineArtists} online)</p>
          <p className="mt-1 text-2xl font-bold text-white">{totalArtists}</p>
          {pendingVerifications > 0 && (
            <Link href="/admin/artists" className="mt-1 block text-xs text-amber-400 hover:underline">
              {pendingVerifications} pending verification
            </Link>
          )}
        </div>
      </div>

      {/* Booking Status Breakdown */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(bookingsByStatus).map(([status, count]) => (
          <span
            key={status}
            className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[status] || "bg-white/10 text-white"}`}
          >
            {status}: {count}
          </span>
        ))}
      </div>

      {/* All Bookings Table */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-200">
          All Bookings ({bookings.length})
        </h3>
        <div className="overflow-x-auto rounded-lg border border-blue-900/30">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-900/30 bg-[#0d1a30]">
                <th className="px-3 py-2 text-left text-xs text-blue-300">Event</th>
                <th className="px-3 py-2 text-left text-xs text-blue-300">Date</th>
                <th className="px-3 py-2 text-left text-xs text-blue-300">Artist</th>
                <th className="px-3 py-2 text-left text-xs text-blue-300">Client</th>
                <th className="px-3 py-2 text-right text-xs text-blue-300">Amount</th>
                <th className="px-3 py-2 text-right text-xs text-blue-300">Commission</th>
                <th className="px-3 py-2 text-center text-xs text-blue-300">Status</th>
                <th className="px-3 py-2 text-center text-xs text-blue-300">Payment</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-blue-400">
                    No bookings yet
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-blue-900/20 hover:bg-blue-900/10">
                    <td className="px-3 py-2 text-white">{b.event_name}</td>
                    <td className="px-3 py-2 text-blue-200">
                      {new Date(b.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-3 py-2 text-blue-200">{b.artist_name || "Unassigned"}</td>
                    <td className="px-3 py-2 text-blue-200">{b.organizer_name || "Guest"}</td>
                    <td className="px-3 py-2 text-right text-white">
                      {"\u20B9"}{b.agreed_amount?.toLocaleString("en-IN") || 0}
                    </td>
                    <td className="px-3 py-2 text-right text-amber-300">
                      {"\u20B9"}{b.platform_revenue?.toLocaleString("en-IN") || 0}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLORS[b.status] || "bg-white/10 text-white"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-blue-300">
                      {b.escrow_status || "none"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Artists */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-200">
            Artists ({totalArtists})
          </h3>
          <Link href="/admin/artists" className="text-xs text-amber-400 hover:underline">
            Manage Artists
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {recentArtists.map((a) => (
            <div key={a.id} className="rounded-lg border border-blue-900/30 bg-[#0d1a30] p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{a.stage_name}</span>
                {a.is_online && <span className="h-2 w-2 rounded-full bg-green-400" title="Online" />}
              </div>
              <p className="text-xs text-blue-300">{a.city} &middot; {a.total_bookings} gigs &middot; {a.avg_rating}&#9733;</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${
                a.verification_status === "verified" ? "bg-green-500/20 text-green-300" :
                a.verification_status === "pending" ? "bg-amber-500/20 text-amber-300" :
                "bg-red-500/20 text-red-400"
              }`}>{a.verification_status}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
