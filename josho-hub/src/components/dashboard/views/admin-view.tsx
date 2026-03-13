interface AdminViewProps {
  profileName: string;
  totalRevenue: number;
  activeUsers: number;
  highPriorityTickets: number;
}

export function AdminView({ profileName, totalRevenue, activeUsers, highPriorityTickets }: AdminViewProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Global Command Center, {profileName}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-blue-800/40 bg-[#162746] p-4">
          <p className="text-sm text-blue-200">Total Revenue (all lines)</p>
          <p className="mt-2 text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-blue-800/40 bg-[#162746] p-4">
          <p className="text-sm text-blue-200">Active Users</p>
          <p className="mt-2 text-2xl font-bold text-white">{activeUsers}</p>
        </div>
        <div className="rounded-xl border border-blue-800/40 bg-[#162746] p-4">
          <p className="text-sm text-blue-200">High Priority IT Tickets</p>
          <p className="mt-2 text-2xl font-bold text-white">{highPriorityTickets}</p>
        </div>
      </div>
    </section>
  );
}
