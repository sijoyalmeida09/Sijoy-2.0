import { ScheduleChangeButton } from "@/components/dashboard/schedule-change-button";
import { LiveEngine } from "@/components/dashboard/live-engine";

interface MusicianBooking {
  id: string;
  event_name: string;
  event_date: string;
  status: string;
  payment_forwarding_status: string;
}

interface Lead {
  id: string;
  client_name: string;
  event_type: string;
  event_date: string;
  venue: string;
  budget: number | null;
  status: "new" | "seen" | "quoted" | "booked";
}

interface MusicianViewProps {
  feed: string[];
  bookings: MusicianBooking[];
  leads?: Lead[];
  profileComplete?: number;
  monthlyEarnings?: number;
  profileViews?: number;
  responseRate?: number;
  artistId?: string | null;
  city?: string;
  isOnline?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-electric/15 text-electric border-electric/30",
  seen: "bg-gold/15 text-gold border-gold/30",
  quoted: "bg-teal/15 text-teal border-teal/30",
  booked: "bg-crimson/15 text-crimson border-crimson/30"
};

const BOOKING_STATUS_COLORS: Record<string, string> = {
  requested: "bg-gold/15 text-gold",
  accepted: "bg-electric/15 text-electric",
  confirmed: "bg-teal/15 text-teal",
  completed: "bg-josho-border text-[#9090b0]",
  cancelled: "bg-crimson/15 text-crimson"
};

export function MusicianView({
  feed,
  bookings,
  leads = [],
  profileComplete = 65,
  monthlyEarnings = 0,
  profileViews = 0,
  responseRate = 0,
  artistId,
  city = "Vasai",
  isOnline = false
}: MusicianViewProps) {
  const upcomingBookings = bookings.filter((b) =>
    ["confirmed", "accepted", "requested"].includes(b.status)
  );

  return (
    <section className="space-y-6">
      {/* ── Go Live Toggle + Gig Radar ───────────── */}
      {artistId && (
        <LiveEngine artistId={artistId} city={city} initialOnline={isOnline} />
      )}

      {/* ── Quick Stats Row ──────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Bookings This Month",
            value: bookings.length.toString(),
            sub: "Total confirmed",
            color: "electric"
          },
          {
            label: "Earnings This Month",
            value: `₹${monthlyEarnings.toLocaleString("en-IN")}`,
            sub: "Net after platform fee",
            color: "gold"
          },
          {
            label: "Profile Views",
            value: profileViews.toLocaleString(),
            sub: "This week",
            color: "teal"
          },
          {
            label: "Response Rate",
            value: `${responseRate}%`,
            sub: "Respond within 4 hrs",
            color: responseRate >= 80 ? "teal" : "gold"
          }
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-josho-border bg-josho-surface p-5"
          >
            <p className="mb-1 text-xs font-medium text-[#9090b0]">{stat.label}</p>
            <p
              className={`text-2xl font-black ${
                stat.color === "gold"
                  ? "text-gradient-electric"
                  : stat.color === "electric"
                  ? "text-electric"
                  : stat.color === "teal"
                  ? "text-teal"
                  : "text-[#eeeef8]"
              }`}
            >
              {stat.value}
            </p>
            <p className="mt-0.5 text-[10px] text-[#505070]">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Profile Completeness Bar ─────────────── */}
      {profileComplete < 100 && (
        <div className="rounded-2xl border border-josho-border bg-josho-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#eeeef8]">
                Your profile is {profileComplete}% complete
              </p>
              <p className="mt-0.5 text-xs text-[#9090b0]">
                A complete profile means 3x more bookings
              </p>
            </div>
            <button className="rounded-xl bg-electric/10 px-4 py-2 text-xs font-bold text-electric transition-all hover:bg-electric/20">
              Complete Now
            </button>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-josho-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-electric to-teal transition-all duration-700"
              style={{ width: `${profileComplete}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Profile Photo", "YouTube Link", "3 more reviews"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-gold/30 bg-gold/8 px-2.5 py-0.5 text-[10px] font-medium text-gold"
              >
                + {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Today's Leads ────────────────────────── */}
      <div className="rounded-2xl border border-josho-border bg-josho-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-[#eeeef8]">Today&apos;s Leads</h3>
          {leads.filter((l) => l.status === "new").length > 0 && (
            <span className="rounded-full bg-electric/15 px-2.5 py-0.5 text-xs font-bold text-electric">
              {leads.filter((l) => l.status === "new").length} new
            </span>
          )}
        </div>

        {leads.length === 0 ? (
          <div className="rounded-xl bg-josho-elevated p-6 text-center">
            <p className="text-3xl mb-2">📬</p>
            <p className="text-sm font-medium text-[#eeeef8]">No leads yet</p>
            <p className="mt-1 text-xs text-[#505070]">
              Complete your profile — the better your profile, the more leads you get
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-start gap-3 rounded-xl border border-josho-border bg-josho-elevated p-4"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-electric/15 text-sm font-bold text-electric">
                  {lead.client_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-[#eeeef8] text-sm">{lead.client_name}</p>
                      <p className="text-xs text-[#9090b0]">
                        {lead.event_type} · {lead.event_date} · {lead.venue}
                      </p>
                      {lead.budget && (
                        <p className="mt-0.5 text-xs font-medium text-gold">
                          Budget: ₹{lead.budget.toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                        STATUS_COLORS[lead.status] ?? "bg-josho-border text-[#9090b0]"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button className="rounded-lg border border-electric/40 bg-electric/10 px-3 py-1 text-xs font-bold text-electric hover:bg-electric/20">
                      Send Quote
                    </button>
                    <button className="rounded-lg border border-josho-border px-3 py-1 text-xs text-[#9090b0] hover:border-crimson/40 hover:text-crimson">
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Upcoming Gigs ─────────────────────────── */}
      <div className="rounded-2xl border border-josho-border bg-josho-surface p-5">
        <h3 className="mb-4 font-bold text-[#eeeef8]">Upcoming Gigs</h3>

        {upcomingBookings.length === 0 ? (
          <div className="rounded-xl bg-josho-elevated p-6 text-center">
            <p className="text-3xl mb-2">🎸</p>
            <p className="text-sm font-medium text-[#eeeef8]">No upcoming gigs</p>
            <p className="mt-1 text-xs text-[#505070]">Improve your profile — leads will come!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.slice(0, 3).map((booking) => (
              <div
                key={booking.id}
                className="rounded-xl border border-josho-border bg-josho-elevated p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[#eeeef8]">{booking.event_name}</p>
                    <p className="mt-0.5 text-xs text-[#9090b0]">{booking.event_date}</p>
                    <p className="mt-0.5 text-xs text-[#505070]">
                      Payment: {booking.payment_forwarding_status}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      BOOKING_STATUS_COLORS[booking.status] ?? "bg-josho-border text-[#9090b0]"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="flex items-center gap-1.5 rounded-lg border border-teal/30 bg-teal/8 px-3 py-1.5 text-xs font-medium text-teal hover:bg-teal/15">
                    📍 Directions
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg border border-josho-border px-3 py-1.5 text-xs font-medium text-[#9090b0] hover:border-josho-glow hover:text-[#eeeef8]">
                    📞 Client Contact
                  </button>
                  <ScheduleChangeButton bookingId={booking.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Feed / Announcements ─────────────────── */}
      {feed.length > 0 && (
        <div className="rounded-2xl border border-josho-border bg-josho-surface p-5">
          <h3 className="mb-3 font-bold text-[#eeeef8]">Platform Updates</h3>
          <ul className="space-y-2">
            {feed.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#9090b0]">
                <span className="mt-0.5 text-electric">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Trending Status ──────────────────────── */}
      <div className="rounded-2xl border border-josho-border bg-josho-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <h3 className="font-bold text-[#eeeef8]">Are you trending?</h3>
          <span className="rounded-full border border-teal/30 bg-teal/10 px-2 py-0.5 text-[10px] font-bold text-teal">AI</span>
        </div>
        <p className="mb-3 text-xs text-[#9090b0]">
          Complete these steps to get trending:
        </p>
        <div className="space-y-2">
          {[
            { step: "Add a YouTube video", done: false },
            { step: "Complete 5+ bookings", done: bookings.length >= 5 },
            { step: "Maintain a 4+ star rating", done: false },
            { step: "Add a profile photo", done: false }
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-2 text-xs">
              <span className={item.done ? "text-teal" : "text-[#505070]"}>
                {item.done ? "✓" : "○"}
              </span>
              <span className={item.done ? "text-teal" : "text-[#9090b0]"}>{item.step}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
