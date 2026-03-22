"use client";

import { useState } from "react";
import { BandBuilder } from "@/components/music/band-builder";
import { BudgetSlider } from "@/components/music/budget-slider";

interface LeadArtist {
  id: string;
  stageName: string;
  eventRate: number;
  profilePhoto: string | null;
  instrument: string;
  commissionPct: number;
}

interface BandMember {
  artistId: string;
  stageName: string;
  instrument: string;
  eventRate: number;
  profilePhoto: string | null;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

interface BookingWizardProps {
  leadArtist: LeadArtist;
  bandMembers: BandMember[];
  showBandStep: boolean;
  currentUser: CurrentUser | null;
}

type Step = "band" | "event" | "budget" | "details" | "confirm" | "done";

export function BookingWizard({ leadArtist, bandMembers, showBandStep, currentUser }: BookingWizardProps) {
  const [step, setStep] = useState<Step>(showBandStep ? "band" : "event");
  const [selectedBand, setSelectedBand] = useState<BandMember[]>([]);
  const [budget, setBudget] = useState(leadArtist.eventRate * 3 || 30000);
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("private");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  // Guest / contact details
  const [guestName, setGuestName] = useState(currentUser?.name || "");
  const [guestEmail, setGuestEmail] = useState(currentUser?.email || "");
  const [guestPhone, setGuestPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const BUNDLE_DISCOUNT_PCT = 10; // 10% off when booking full band (2+ artists)

  const allArtists = [
    { artistId: leadArtist.id, stageName: leadArtist.stageName, instrument: leadArtist.instrument, eventRate: leadArtist.eventRate, profilePhoto: leadArtist.profilePhoto },
    ...selectedBand
  ];
  const totalCost = allArtists.reduce((sum, a) => sum + a.eventRate, 0);
  const isFullBand = selectedBand.length > 0;
  const bundleDiscount = isFullBand ? Math.round(totalCost * (BUNDLE_DISCOUNT_PCT / 100)) : 0;
  const agreedAmount = totalCost - bundleDiscount;
  const platformCut = Math.round(agreedAmount * (leadArtist.commissionPct / 100));
  const artistPayout = agreedAmount - platformCut;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: leadArtist.id,
          bandMemberIds: selectedBand.map((m) => m.artistId),
          eventName,
          eventType,
          eventDate,
          venue,
          description,
          agreedAmount,
          // Guest details (used when not logged in)
          guestName: currentUser ? undefined : guestName,
          guestEmail: currentUser ? undefined : guestEmail,
          guestPhone: currentUser ? undefined : guestPhone,
        })
      });
      if (!res.ok) throw new Error("Booking failed");
      setStep("done");
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const stepLabels: { key: Step; label: string }[] = [
    ...(showBandStep ? [{ key: "band" as Step, label: "Build Band" }] : []),
    { key: "event", label: "Event Details" },
    { key: "budget", label: "Budget" },
    { key: "details", label: "Your Details" },
    { key: "confirm", label: "Confirm" }
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      {/* Progress bar */}
      {step !== "done" && (
        <div className="mb-6 flex items-center gap-1">
          {stepLabels.map((s, i) => (
            <div key={s.key} className="flex flex-1 items-center gap-1">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  step === s.key ? "bg-joshoBlue text-white" : "bg-blue-900/40 text-blue-400"
                }`}
              >
                {i + 1}
              </div>
              <span className={`hidden text-xs sm:inline ${step === s.key ? "font-semibold text-white" : "text-blue-400"}`}>
                {s.label}
              </span>
              {i < stepLabels.length - 1 && <div className="mx-1 h-px flex-1 bg-blue-900/40" />}
            </div>
          ))}
        </div>
      )}

      {/* Lead artist card (always visible) */}
      {step !== "done" && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-joshoBlue/30 bg-[#13213d] p-3">
          <div className="h-12 w-12 overflow-hidden rounded-lg bg-[#0d1a30]">
            {leadArtist.profilePhoto ? (
              <img src={leadArtist.profilePhoto} alt={leadArtist.stageName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-lg text-blue-600">{leadArtist.stageName.charAt(0)}</div>
            )}
          </div>
          <div>
            <p className="font-semibold text-white">{leadArtist.stageName}</p>
            <p className="text-xs text-blue-300">{leadArtist.instrument} &middot; &#8377;{leadArtist.eventRate.toLocaleString("en-IN")}</p>
          </div>
        </div>
      )}

      {/* Step: Build Band */}
      {step === "band" && (
        <section className="space-y-5 rounded-xl border border-blue-900/30 bg-[#13213d] p-5">
          <h2 className="text-lg font-bold text-white">Build Your Dream Band</h2>
          <p className="text-sm text-blue-200">
            {leadArtist.stageName} is your lead. Add more musicians to create the perfect lineup for your event.
          </p>
          <BudgetSlider min={5000} max={200000} value={budget} onChange={setBudget} label="Total band budget" />
          <BandBuilder recommendations={bandMembers} budget={budget} onSelectionChange={setSelectedBand} />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep("event")}
              className="rounded-full bg-joshoBlue px-6 py-2.5 text-sm font-bold text-white hover:opacity-90"
            >
              Next: Event Details
            </button>
          </div>
        </section>
      )}

      {/* Step: Event Details */}
      {step === "event" && (
        <section className="space-y-4 rounded-xl border border-blue-900/30 bg-[#13213d] p-5">
          <h2 className="text-lg font-bold text-white">Tell us about your event</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-blue-200">Event Name</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Sharma Wedding Reception"
                className="w-full rounded-lg border border-blue-800/40 bg-[#0d1a30] px-3 py-2 text-sm text-white outline-none ring-joshoBlue placeholder:text-blue-700 focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-blue-200">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full rounded-lg border border-blue-800/40 bg-[#0d1a30] px-3 py-2 text-sm text-white outline-none ring-joshoBlue focus:ring-2"
              >
                <option value="private">Private Party</option>
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate Event</option>
                <option value="parish_feast">Parish Feast</option>
                <option value="college">College Event</option>
                <option value="concert">Concert / Show</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-blue-200">Event Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded-lg border border-blue-800/40 bg-[#0d1a30] px-3 py-2 text-sm text-white outline-none ring-joshoBlue focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-blue-200">Venue</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. St. Thomas Church Hall, Vasai"
                className="w-full rounded-lg border border-blue-800/40 bg-[#0d1a30] px-3 py-2 text-sm text-white outline-none ring-joshoBlue placeholder:text-blue-700 focus:ring-2"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-blue-200">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Any special requests, song preferences, timeline..."
              className="w-full rounded-lg border border-blue-800/40 bg-[#0d1a30] px-3 py-2 text-sm text-white outline-none ring-joshoBlue placeholder:text-blue-700 focus:ring-2"
            />
          </div>
          <div className="flex justify-between">
            {showBandStep && (
              <button type="button" onClick={() => setStep("band")} className="text-sm text-blue-300 hover:text-white">
                &larr; Back
              </button>
            )}
            <button
              type="button"
              onClick={() => setStep("budget")}
              disabled={!eventName || !eventDate}
              className="ml-auto rounded-full bg-joshoBlue px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40"
            >
              Next: Review Budget
            </button>
          </div>
        </section>
      )}

      {/* Step: Budget Review */}
      {step === "budget" && (
        <section className="space-y-4 rounded-xl border border-blue-900/30 bg-[#13213d] p-5">
          <h2 className="text-lg font-bold text-white">Budget Breakdown</h2>
          <div className="space-y-2 rounded-lg border border-blue-900/20 bg-[#0d1a30] p-4">
            {allArtists.map((a) => (
              <div key={a.artistId} className="flex items-center justify-between text-sm">
                <span className="text-blue-100">{a.stageName} <span className="text-xs text-blue-400">({a.instrument})</span></span>
                <span className="font-medium text-white">&#8377;{a.eventRate.toLocaleString("en-IN")}</span>
              </div>
            ))}
            {isFullBand && bundleDiscount > 0 && (
              <div className="flex justify-between text-sm text-amber-400">
                <span>Full band discount ({BUNDLE_DISCOUNT_PCT}%)</span>
                <span>-&#8377;{bundleDiscount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="mt-3 border-t border-blue-900/30 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-blue-300">Total artist fee</span>
                <span className="font-bold text-white">&#8377;{agreedAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-xs text-blue-400">
                <span>Platform fee ({leadArtist.commissionPct}%, deducted from artist fee)</span>
                <span>&#8377;{platformCut.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-xs text-blue-400">
                <span>Artist receives</span>
                <span>&#8377;{artistPayout.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-blue-500">
              You pay &#8377;{agreedAmount.toLocaleString("en-IN")}. Platform fee is deducted from the artist&apos;s side, not yours.
            </p>
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep("event")} className="text-sm text-blue-300 hover:text-white">
              &larr; Back
            </button>
            <button
              type="button"
              onClick={() => setStep("details")}
              className="rounded-full bg-joshoBlue px-6 py-2.5 text-sm font-bold text-white hover:opacity-90"
            >
              Next: Your Details
            </button>
          </div>
        </section>
      )}

      {/* Step: Your Details */}
      {step === "details" && (
        <section className="space-y-4 rounded-xl border border-blue-900/30 bg-[#13213d] p-5">
          <h2 className="text-lg font-bold text-white">
            {currentUser ? "Confirm Booking Details" : "Enter Your Details"}
          </h2>

          {currentUser ? (
            // Logged-in: show read-only info
            <div className="rounded-lg border border-blue-900/20 bg-[#0d1a30] p-4 space-y-2">
              <p className="text-sm text-blue-200">
                Logged in as <span className="font-bold text-white">{currentUser.name || currentUser.email}</span>
              </p>
              <p className="text-xs text-blue-400">Booking confirmation will be sent to {currentUser.email}.</p>
            </div>
          ) : (
            // Guest: collect contact info
            <div className="space-y-3">
              <p className="text-xs text-blue-300">
                No account needed — just provide your contact details. The artist will reach out directly.
              </p>
              <div>
                <label className="mb-1 block text-xs font-medium text-blue-200">Your Name *</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-lg border border-blue-800/40 bg-[#0d1a30] px-3 py-2 text-sm text-white outline-none ring-joshoBlue placeholder:text-blue-700 focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-blue-200">Phone Number *</label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-lg border border-blue-800/40 bg-[#0d1a30] px-3 py-2 text-sm text-white outline-none ring-joshoBlue placeholder:text-blue-700 focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-blue-200">Email (optional)</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="rahul@email.com"
                  className="w-full rounded-lg border border-blue-800/40 bg-[#0d1a30] px-3 py-2 text-sm text-white outline-none ring-joshoBlue placeholder:text-blue-700 focus:ring-2"
                />
              </div>
              <p className="text-[10px] text-blue-500">
                You can create an account later — all bookings will be tracked.
              </p>
            </div>
          )}

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep("budget")} className="text-sm text-blue-300 hover:text-white">
              &larr; Back
            </button>
            <button
              type="button"
              onClick={() => setStep("confirm")}
              disabled={!currentUser && !guestName.trim()}
              className="rounded-full bg-joshoBlue px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40"
            >
              Next: Confirm Booking
            </button>
          </div>
        </section>
      )}

      {/* Step: Confirm */}
      {step === "confirm" && (
        <section className="space-y-4 rounded-xl border border-blue-900/30 bg-[#13213d] p-5">
          <h2 className="text-lg font-bold text-white">Confirm Your Booking</h2>
          <div className="space-y-2 rounded-lg border border-blue-900/20 bg-[#0d1a30] p-4 text-sm">
            <div className="flex justify-between"><span className="text-blue-300">Event</span><span className="text-white">{eventName}</span></div>
            <div className="flex justify-between"><span className="text-blue-300">Type</span><span className="text-white">{eventType}</span></div>
            <div className="flex justify-between"><span className="text-blue-300">Date</span><span className="text-white">{eventDate}</span></div>
            <div className="flex justify-between"><span className="text-blue-300">Venue</span><span className="text-white">{venue || "TBD"}</span></div>
            <div className="flex justify-between"><span className="text-blue-300">Artists</span><span className="text-white">{allArtists.map((a) => a.stageName).join(", ")}</span></div>
            <div className="flex justify-between border-t border-blue-900/30 pt-2"><span className="text-blue-300">Total</span><span className="text-lg font-bold text-white">&#8377;{agreedAmount.toLocaleString("en-IN")}</span></div>
          </div>
          <p className="text-center text-xs text-blue-400">
            By confirming, a booking request is sent to the artist(s). Payment is collected only after they accept.
          </p>
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep("budget")} className="text-sm text-blue-300 hover:text-white">
              &larr; Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-full bg-green-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-green-500 disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Confirm Booking Request"}
            </button>
          </div>
        </section>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <section className="rounded-2xl border border-green-700/30 bg-[#0d2818] p-8 text-center">
          <div className="text-5xl">&#127926;</div>
          <h2 className="mt-4 text-2xl font-bold text-white">Booking Request Sent!</h2>
          <p className="mt-2 text-sm text-green-200">
            {leadArtist.stageName} will review your request and respond within 48 hours.
            You&apos;ll get a notification once they accept.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="/discover" className="rounded-full border border-green-600 px-5 py-2 text-sm text-green-200 hover:bg-green-900/30">
              Browse More Artists
            </a>
            <a href="/dashboard" className="rounded-full bg-joshoBlue px-5 py-2 text-sm font-bold text-white hover:opacity-90">
              Go to Dashboard
            </a>
          </div>
        </section>
      )}
    </main>
  );
}
