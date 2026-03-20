"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GigActions({ bookingId, currentStatus }: { bookingId: string; currentStatus: string }) {
  const router  = useRouter();
  const [loading, setLoading]             = useState(false);
  const [showCashForm, setShowCashForm]   = useState(false);
  const [cashAmount, setCashAmount]       = useState("");
  const [tipAmount, setTipAmount]         = useState("");

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

  async function confirmCash() {
    const cash = parseInt(cashAmount, 10);
    const tip  = parseInt(tipAmount || "0", 10);
    if (!cash || cash <= 0) { alert("Enter valid cash amount"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/payments/confirm-cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, cashReceivedInr: cash, tipInr: tip })
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      alert("Failed to confirm. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // Artist accepts or declines new request
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

  // Artist confirms cash received after completing the gig
  if (currentStatus === "accepted" || currentStatus === "confirmed") {
    if (showCashForm) {
      return (
        <div className="space-y-3 rounded-xl border border-green-800/30 bg-[#0d2818] p-4">
          <p className="text-sm font-semibold text-green-200">Confirm Cash Received</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-green-300">Cash received (₹) *</label>
              <input
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full rounded-lg border border-green-800/40 bg-[#0a1f10] px-3 py-2 text-sm text-white outline-none ring-green-600 placeholder:text-green-900 focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-green-300">Tip received (₹) optional</label>
              <input
                type="number"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                placeholder="e.g. 500"
                className="w-full rounded-lg border border-green-800/40 bg-[#0a1f10] px-3 py-2 text-sm text-white outline-none ring-green-600 placeholder:text-green-900 focus:ring-2"
              />
            </div>
          </div>
          <p className="text-xs text-green-500">
            Platform fee (10%) will be deducted from cash amount. Tips go 100% to you.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={confirmCash}
              disabled={loading || !cashAmount}
              className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-500 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Confirm & Complete Gig"}
            </button>
            <button
              type="button"
              onClick={() => setShowCashForm(false)}
              className="text-sm text-blue-300 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setShowCashForm(true)}
        className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-500"
      >
        Mark Gig Complete + Confirm Cash
      </button>
    );
  }

  return null;
}
