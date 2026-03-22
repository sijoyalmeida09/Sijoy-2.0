"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface GoLiveToggleProps {
  artistId: string;
  initialOnline: boolean;
  city: string;
  onToggle?: (isOnline: boolean) => void;
}

export function GoLiveToggle({ artistId, initialOnline, city, onToggle }: GoLiveToggleProps) {
  const [isOnline, setIsOnline] = useState(initialOnline);
  const [loading, setLoading] = useState(false);
  const [onlineSince, setOnlineSince] = useState<Date | null>(initialOnline ? new Date() : null);
  const supabase = createClient();

  // Track time online
  useEffect(() => {
    if (!isOnline) { setOnlineSince(null); return; }
    if (!onlineSince) setOnlineSince(new Date());
    const timer = setInterval(() => setOnlineSince((d) => d ? new Date(d.getTime()) : null), 60000);
    return () => clearInterval(timer);
  }, [isOnline]);

  // Auto go-offline on page close
  useEffect(() => {
    if (!isOnline) return;
    const handleUnload = () => {
      fetch("/api/artists/go-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ online: false, city }),
        keepalive: true,
      });
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [isOnline, city]);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/artists/go-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ online: !isOnline, city }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "Failed to update status");
        return;
      }
      setIsOnline(!isOnline);
      onToggle?.(!isOnline);
    } finally {
      setLoading(false);
    }
  }

  function formatOnlineTime() {
    if (!onlineSince) return "";
    const mins = Math.floor((Date.now() - onlineSince.getTime()) / 60000);
    if (mins < 1) return "Just went live";
    if (mins < 60) return `${mins}m online`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m online`;
  }

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-500 ${
      isOnline
        ? "border-teal/40 bg-teal/5"
        : "border-josho-border bg-josho-surface"
    }`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Pulse indicator */}
          <div className="relative flex h-10 w-10 items-center justify-center">
            {isOnline && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-30" />
            )}
            <span className={`relative inline-flex h-5 w-5 rounded-full ${isOnline ? "bg-teal" : "bg-josho-border"}`} />
          </div>

          <div>
            <p className="font-bold text-[#eeeef8]">
              {isOnline ? "🟢 You are LIVE" : "⚫ You are Offline"}
            </p>
            <p className="text-xs text-[#9090b0]">
              {isOnline
                ? formatOnlineTime() || "Gig requests can come in now"
                : "Go Live — get instant gig requests"}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          type="button"
          onClick={toggle}
          disabled={loading}
          className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-300 disabled:opacity-60 ${
            isOnline ? "border-teal bg-teal" : "border-josho-border bg-josho-elevated"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
              isOnline ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {isOnline && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "City", value: city },
            { label: "Status", value: "Accepting Gigs" },
            { label: "Mode", value: "Instant" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-teal/10 px-2 py-2">
              <p className="text-[10px] text-teal/70">{item.label}</p>
              <p className="text-xs font-bold text-teal">{item.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
