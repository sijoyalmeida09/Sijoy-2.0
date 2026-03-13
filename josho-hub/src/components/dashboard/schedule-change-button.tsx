"use client";

import { useState } from "react";

export function ScheduleChangeButton({ bookingId }: { bookingId: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submitRequest() {
    try {
      setStatus("sending");
      const response = await fetch("/api/bookings/request-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          type: "reschedule",
          reason: "Need a schedule update"
        })
      });
      if (!response.ok) throw new Error("Request failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={submitRequest}
        disabled={status === "sending" || status === "done"}
        className="rounded-md bg-joshoBlue px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {status === "sending" ? "Submitting..." : status === "done" ? "Change requested" : "Request schedule change"}
      </button>
      {status === "error" && <p className="mt-1 text-xs text-red-300">Could not send request. Try again.</p>}
    </div>
  );
}
