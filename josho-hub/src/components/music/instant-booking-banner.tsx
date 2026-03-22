import Link from "next/link";

export function InstantBookingBanner() {
  return (
    <div className="glass-card-red relative overflow-hidden p-6 sm:p-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-electric/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-electric/[0.08] blur-2xl" />

      <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        {/* Left */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="badge-live">TONIGHT</span>
            <span className="text-sm font-medium text-white">12 artists available tonight in Vasai-Virar</span>
          </div>
          <h2 className="text-xl font-black text-white sm:text-2xl">
            Event tonight? Book now.
          </h2>
          <p className="mt-1 text-sm text-secondary">
            Artists available for last-minute bookings. Confirmed within 30 minutes.
          </p>
          <p className="mt-2 text-xs text-muted">
            Vasai · Virar · Nalasopara · Mumbai
          </p>
        </div>

        {/* Right */}
        <Link
          href="/tonight"
          className="flex-shrink-0 btn-red px-6 py-3 text-sm"
        >
          View →
        </Link>
      </div>
    </div>
  );
}
