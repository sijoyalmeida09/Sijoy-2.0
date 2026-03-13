import { ScheduleChangeButton } from "@/components/dashboard/schedule-change-button";

interface MusicianBooking {
  id: string;
  event_name: string;
  event_date: string;
  status: string;
  payment_forwarding_status: string;
}

interface MusicianViewProps {
  feed: string[];
  bookings: MusicianBooking[];
}

export function MusicianView({ feed, bookings }: MusicianViewProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Musician Dashboard</h2>

      <div className="rounded-xl border border-blue-800/40 bg-[#162746] p-4">
        <h3 className="text-sm uppercase tracking-wide text-blue-200">My Feed</h3>
        <ul className="mt-3 space-y-2 text-sm text-blue-50">
          {feed.length === 0 ? <li>No feed updates yet.</li> : feed.map((item) => <li key={item}>- {item}</li>)}
        </ul>
      </div>

      <div className="rounded-xl border border-blue-800/40 bg-[#162746] p-4">
        <h3 className="text-sm uppercase tracking-wide text-blue-200">Upcoming Bookings</h3>
        <div className="mt-3 space-y-3">
          {bookings.length === 0 && <p className="text-sm text-blue-50">No upcoming bookings yet.</p>}
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-lg border border-blue-900/40 bg-[#1b2f53] p-3">
              <p className="font-medium text-white">{booking.event_name}</p>
              <p className="text-sm text-blue-100">
                {booking.event_date} • {booking.status}
              </p>
              <p className="text-sm text-blue-200">
                Payment forwarding: {booking.payment_forwarding_status}
              </p>
              <ScheduleChangeButton bookingId={booking.id} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
