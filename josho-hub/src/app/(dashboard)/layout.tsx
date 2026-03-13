import { requireProfile } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { LoyaltyCard } from "@/components/dashboard/loyalty-card";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6">
      <header className="mb-5 flex flex-col gap-4 rounded-xl border border-blue-900/40 bg-[#13213d] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-blue-300">JoSho Empire Central Hub</p>
          <h1 className="text-lg font-semibold text-white">Welcome, {profile.full_name ?? profile.email}</h1>
          <p className="text-sm text-blue-100">Role: {profile.role}</p>
          <form action="/auth/logout" method="post" className="mt-2">
            <button
              type="submit"
              className="rounded-md border border-blue-500 px-2 py-1 text-xs text-blue-100 hover:bg-blue-900/30"
            >
              Logout
            </button>
          </form>
        </div>
        <LoyaltyCard points={profile.loyalty_points} />
      </header>

      <div className="flex flex-col gap-5 md:flex-row">
        <Sidebar role={profile.role} />
        <section className="min-w-0 flex-1 rounded-xl border border-blue-900/40 bg-[#13213d] p-4">{children}</section>
      </div>
    </main>
  );
}
