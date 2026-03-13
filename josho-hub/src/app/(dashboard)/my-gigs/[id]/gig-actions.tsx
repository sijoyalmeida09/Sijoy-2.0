"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GigActions({ bookingId, currentStatus }: { bookingId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: newStatus })
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      alert("Action failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (currentStatus === "requested") {
    return (
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => updateStatus("accepted")}
          disabled={loading}
          className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-500 disabled:opacity-50"
        >
          Accept Gig
        </button>
        <button
          type="button"
          onClick={() => updateStatus("cancelled")}
          disabled={loading}
          className="rounded-full border border-red-600 px-6 py-2.5 text-sm font-bold text-red-300 hover:bg-red-900/20 disabled:opacity-50"
        >
          Decline
        </button>
      </div>
    );
  }

  if (currentStatus === "accepted" || currentStatus === "confirmed") {
    return (
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => updateStatus("completed")}
          disabled={loading}
          className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-500 disabled:opacity-50"
        >
          Mark as Completed
        </button>
      </div>
    );
  }

  return null;
}
