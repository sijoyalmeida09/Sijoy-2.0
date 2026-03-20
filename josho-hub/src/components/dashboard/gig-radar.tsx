"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface IncomingGig {
  gigId: string;
  eventType: string;
  venue: string;
  city: string;
  amount: number;
  eventDate: string;
  clientName: string;
  duration?: number;
}

interface GigRadarProps {
  artistId: string;
  city: string;
  isOnline: boolean;
}

const ACCEPT_WINDOW = 60; // seconds

export function GigRadar({ artistId, city, isOnline }: GigRadarProps) {
  const [incomingGig, setIncomingGig] = useState<IncomingGig | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(ACCEPT_WINDOW);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  const dismissGig = useCallback(() => {
    setIncomingGig(null);
    setSecondsLeft(ACCEPT_WINDOW);
    setAccepted(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Start countdown when gig arrives
  useEffect(() => {
    if (!incomingGig || accepted) return;
    setSecondsLeft(ACCEPT_WINDOW);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { dismissGig(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [incomingGig, accepted, dismissGig]);

  // Subscribe to gig-requests channel
  useEffect(() => {
    if (!isOnline) return;

    const channel = supabase
      .channel(`gig-requests:${city}`)
      .on("broadcast", { event: "new-gig" }, ({ payload }) => {
        const gig = payload as IncomingGig;
        setIncomingGig(gig);
        // Play notification sound
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.4);
        } catch { /* audio not supported */ }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isOnline, city, supabase]);

  async function acceptGig() {
    if (!incomingGig) return;
    setAccepting(true);
    try {
      const res = await fetch("/api/bookings/accept-instant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gigId: incomingGig.gigId, artistId }),
      });
      if (res.ok) {
        setAccepted(true);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        alert("Gig already taken — another one will come!");
        dismissGig();
      }
    } finally {
      setAccepting(false);
    }
  }

  if (!isOnline || !incomingGig) return null;

  const progress = (secondsLeft / ACCEPT_WINDOW) * 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDash = (progress / 100) * circumference;
  const urgent = secondsLeft <= 15;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-josho-bg/90 backdrop-blur-sm p-4">
      <div className={`relative w-full max-w-sm rounded-3xl border p-6 shadow-2xl transition-all ${
        accepted
          ? "border-teal/50 bg-teal/10"
          : urgent
          ? "border-crimson/50 bg-josho-surface animate-pulse"
          : "border-electric/30 bg-josho-surface"
      }`}>

        {/* Accepted state */}
        {accepted ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-xl font-black text-teal">Gig Accepted!</h3>
            <p className="mt-2 text-sm text-[#9090b0]">
              The client has been confirmed. Details are in your dashboard.
            </p>
            <button
              onClick={dismissGig}
              className="mt-5 w-full rounded-xl bg-teal px-6 py-3 text-sm font-bold text-white"
            >
              View Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-crimson animate-ping" />
                <span className="text-xs font-bold uppercase tracking-widest text-crimson">
                  Instant Gig Request
                </span>
              </div>
              <button onClick={dismissGig} className="text-[#505070] hover:text-[#9090b0] text-lg">×</button>
            </div>

            {/* Countdown ring */}
            <div className="flex items-center gap-5 mb-5">
              <div className="relative flex-shrink-0">
                <svg width="96" height="96" className="-rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#1a1a2e" strokeWidth="6" />
                  <circle
                    cx="48" cy="48" r="40" fill="none"
                    stroke={urgent ? "#ff3355" : "#00e5ff"}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - strokeDash}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-black ${urgent ? "text-crimson" : "text-electric"}`}>
                    {secondsLeft}
                  </span>
                  <span className="text-[9px] text-[#505070]">seconds</span>
                </div>
              </div>

              {/* Gig details */}
              <div className="flex-1 min-w-0">
                <p className="text-lg font-black text-[#eeeef8] capitalize">
                  {incomingGig.eventType.replace("_", " ")}
                </p>
                <p className="text-sm text-[#9090b0] truncate">{incomingGig.venue}</p>
                <p className="text-xs text-[#505070]">{incomingGig.city} · {incomingGig.eventDate}</p>
                {incomingGig.duration && (
                  <p className="text-xs text-[#505070]">{incomingGig.duration} hours</p>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="mb-5 rounded-2xl border border-gold/20 bg-gold/8 px-5 py-4 text-center">
              <p className="text-xs text-gold/70 mb-0.5">You will earn</p>
              <p className="text-3xl font-black text-gradient-gold">
                ₹{incomingGig.amount.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-[#505070] mt-0.5">Platform fee already deducted</p>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={dismissGig}
                className="rounded-xl border border-josho-border py-3 text-sm font-medium text-[#9090b0] hover:border-crimson/40 hover:text-crimson transition-colors"
              >
                Skip
              </button>
              <button
                onClick={acceptGig}
                disabled={accepting}
                className="rounded-xl bg-gradient-to-r from-electric to-teal py-3 text-sm font-black text-white shadow-electric hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {accepting ? "Accepting..." : "✓ Accept"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
