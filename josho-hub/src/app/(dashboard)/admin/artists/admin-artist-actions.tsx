"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminArtistActions({ artistId }: { artistId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  async function act(status: "verified" | "rejected") {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/artists/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId,
          status,
          rejectionReason: status === "rejected" ? reason : null
        })
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      alert("Action failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => act("verified")}
        disabled={loading}
        className="rounded-full bg-green-600 px-5 py-1.5 text-sm font-bold text-white hover:bg-green-500 disabled:opacity-50"
      >
        Verify
      </button>
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Rejection reason (optional)"
        className="flex-1 rounded-lg border border-red-800/40 bg-[#0d1a30] px-3 py-1.5 text-sm text-white outline-none placeholder:text-blue-700"
      />
      <button
        type="button"
        onClick={() => act("rejected")}
        disabled={loading}
        className="rounded-full border border-red-600 px-5 py-1.5 text-sm font-bold text-red-300 hover:bg-red-900/20 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
