import Link from "next/link";
import type { Role } from "@/types/domain";

const navByRole: Record<Role, { href: string; label: string }[]> = {
  admin: [
    { href: "/dashboard", label: "Command Center" },
    { href: "/admin/artists", label: "Verify Artists" },
    { href: "/my-bookings", label: "All Bookings" },
    { href: "/my-earnings", label: "Revenue" },
    { href: "/discover", label: "Browse Artists" }
  ],
  musician: [
    { href: "/dashboard", label: "My Dashboard" },
    { href: "/my-gigs", label: "My Gigs" },
    { href: "/my-wallet", label: "My Wallet" },
    { href: "/my-earnings", label: "My Earnings" },
    { href: "/discover", label: "Browse Artists" }
  ],
  client: [
    { href: "/dashboard", label: "My Dashboard" },
    { href: "/my-bookings", label: "My Bookings" },
    { href: "/discover", label: "Book an Artist" }
  ],
  user: [
    { href: "/dashboard", label: "My Dashboard" },
    { href: "/my-bookings", label: "My Bookings" },
    { href: "/discover", label: "Book an Artist" }
  ]
};

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="w-full rounded-xl border border-blue-900/40 bg-[#13213d] p-4 md:w-72">
      <p className="mb-3 text-xs uppercase tracking-wide text-blue-200">Navigation</p>
      <nav className="space-y-2">
        {navByRole[role].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-3 py-2 text-sm text-blue-100 transition hover:bg-joshoBlue hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
