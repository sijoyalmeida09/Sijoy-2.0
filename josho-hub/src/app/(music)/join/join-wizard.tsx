"use client";

import { useState, useEffect, useRef } from "react";
import { PremiumUpsellModal } from "@/components/music/premium-upsell-modal";
import { ImageUpload } from "@/components/ui/image-upload";

const GENRES = [
  { slug: "bollywood", name: "Bollywood" },
  { slug: "sufi", name: "Sufi / Qawwali" },
  { slug: "western", name: "Western / Rock" },
  { slug: "vasaikar", name: "Vasaikar Folk" },
  { slug: "classical", name: "Indian Classical" },
  { slug: "gospel", name: "Gospel / Church" },
  { slug: "marathi", name: "Marathi" },
  { slug: "edm", name: "EDM / Electronic" },
  { slug: "jazz", name: "Jazz / Blues" },
  { slug: "fusion", name: "Fusion" }
];

const INSTRUMENTS = [
  { slug: "vocals", name: "Vocals" },
  { slug: "guitar", name: "Guitar" },
  { slug: "keyboard", name: "Keyboard / Synth" },
  { slug: "drums", name: "Drums / Percussion" },
  { slug: "bass", name: "Bass Guitar" },
  { slug: "violin", name: "Violin" },
  { slug: "flute", name: "Flute" },
  { slug: "tabla", name: "Tabla" },
  { slug: "harmonium", name: "Harmonium" },
  { slug: "dholki", name: "Dholki / Dholak" },
  { slug: "sax", name: "Saxophone" },
  { slug: "trumpet", name: "Trumpet" },
  { slug: "dj", name: "DJ / Turntables" },
  { slug: "producer", name: "Music Producer" },
  { slug: "sound_eng", name: "Sound Engineer" }
];

const GEAR_ITEMS = [
  { slug: "pa", name: "PA System / Speakers" },
  { slug: "keyboard", name: "Keyboard / Piano" },
  { slug: "drum_kit", name: "Full Drum Kit" },
  { slug: "guitar_amp", name: "Guitar + Amp" },
  { slug: "mic", name: "Microphone Set" },
  { slug: "lighting", name: "Stage Lighting" },
  { slug: "dhol", name: "Dhol / Tabla" },
  { slug: "other", name: "Other Equipment" }
];

type Step = 1 | 2 | 3 | 4 | "done";

export function JoinWizard() {
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [stageName, setStageName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Vasai-Virar");
  const [eventRate, setEventRate] = useState("");

  // Step 2
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);

  // Step 3
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [bio, setBio] = useState("");

  // Step 4 — Gear
  const [selectedGear, setSelectedGear] = useState<string[]>([]);
  const [gearRates, setGearRates] = useState<Record<string, string>>({});

  // Misc
  const [submitting, setSubmitting] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [suggestedLoading, setSuggestedLoading] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const upsellShown = useRef(false);

  useEffect(() => {
    if (selectedInstruments.length === 0) { setSuggestedPrice(null); return; }
    setSuggestedLoading(true);
    fetch(`/api/artists/suggested-price?instruments=${selectedInstruments.join(",")}&region=${encodeURIComponent(city)}`)
      .then((r) => r.json())
      .then((d) => setSuggestedPrice(d.suggested ?? null))
      .catch(() => setSuggestedPrice(null))
      .finally(() => setSuggestedLoading(false));
  }, [selectedInstruments, city]);

  function toggleItem(list: string[], item: string, setter: (v: string[]) => void) {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }

  async function handleSubmit() {
    if (!youtubeUrl && !instagramHandle && !upsellShown.current) {
      setShowUpsell(true);
      upsellShown.current = true;
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/artists/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stageName, email, phone, city, bio,
          eventRate: eventRate ? Number(eventRate) : null,
          genres: selectedGenres,
          instruments: selectedInstruments,
          profilePhoto: profilePhoto || null,
          youtubeUrl: youtubeUrl || null,
          instagramHandle: instagramHandle || null,
          gear: selectedGear.map((g) => ({
            type: g,
            ratePerDay: gearRates[g] ? Number(gearRates[g]) : null
          }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Registration failed");
      setStep("done");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const stepNumber = typeof step === "number" ? step : 4;
  const totalSteps = 4;

  return (
    <>
      <PremiumUpsellModal
        open={showUpsell}
        onClose={() => setShowUpsell(false)}
        reason="no_video"
      />

      {/* Progress Bar */}
      {step !== "done" && (
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium text-[#9090b0]">Step {stepNumber} of {totalSteps}</p>
            <p className="text-xs text-[#505070]">
              {step === 1 ? "Basic Info" : step === 2 ? "Your Sound" : step === 3 ? "Showcase" : "Gear"}
            </p>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-josho-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-electric to-teal transition-all duration-500"
              style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
            />
          </div>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  s < stepNumber ? "bg-teal" : s === stepNumber ? "bg-electric" : "bg-josho-border"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 1 ──────────────────────────────── */}
      {step === 1 && (
        <div className="animate-slide-up space-y-6">
          <div>
            <h2 className="text-2xl font-black text-[#eeeef8]">Mumbai&apos;s next big artist? Start here.</h2>
            <p className="mt-1 text-sm text-[#9090b0]">30 seconds. Just the basics — more later.</p>
          </div>

          {/* Profile Photo + Name row */}
          <div className="flex items-start gap-4">
            <div>
              <p className="mb-2 text-xs font-medium text-[#9090b0]">Photo</p>
              <ImageUpload
                bucket="artist-photos"
                folder="profiles"
                value={profilePhoto}
                onChange={setProfilePhoto}
                placeholder="+"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-[#9090b0]">Stage Name / Band Name</label>
              <input
                type="text"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="e.g. DJ Rahul, Priya Vocals, The Brass Boys"
                className="w-full rounded-xl border border-josho-border bg-josho-elevated px-4 py-3 text-sm text-[#eeeef8] placeholder:text-[#505070] outline-none focus:border-electric/60 focus:ring-1 focus:ring-electric/20"
              />
              <p className="mt-1 text-[10px] text-[#505070]">This is the name clients will see — use your best name</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#9090b0]">WhatsApp Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-josho-border bg-josho-elevated px-4 py-3 text-sm text-[#eeeef8] placeholder:text-[#505070] outline-none focus:border-electric/60 focus:ring-1 focus:ring-electric/20"
              />
              <p className="mt-1 text-[10px] text-[#505070]">Clients will contact you here — direct WhatsApp</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#9090b0]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full rounded-xl border border-josho-border bg-josho-elevated px-4 py-3 text-sm text-[#eeeef8] placeholder:text-[#505070] outline-none focus:border-electric/60 focus:ring-1 focus:ring-electric/20"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#9090b0]">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-josho-border bg-josho-elevated px-4 py-3 text-sm text-[#eeeef8] outline-none focus:border-electric/60"
              >
                <option value="Vasai-Virar">Vasai-Virar</option>
                <option value="Vasai">Vasai</option>
                <option value="Virar">Virar</option>
                <option value="Nalasopara">Nalasopara</option>
                <option value="Nallasopara">Nallasopara</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Thane">Thane</option>
                <option value="Palghar">Palghar</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#9090b0]">Event Rate (₹)</label>
              <input
                type="number"
                value={eventRate}
                onChange={(e) => setEventRate(e.target.value)}
                placeholder="e.g. 2,000"
                className="w-full rounded-xl border border-josho-border bg-josho-elevated px-4 py-3 text-sm text-[#eeeef8] placeholder:text-[#505070] outline-none focus:border-electric/60 focus:ring-1 focus:ring-electric/20"
              />
              <p className="mt-1 text-[10px] text-[#505070]">You can change this later. Enter an approximate amount for now.</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!stageName || !phone}
              className="btn-gold px-8 py-3 text-sm disabled:opacity-40"
            >
              Next: Your Sound →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2 ──────────────────────────────── */}
      {step === 2 && (
        <div className="animate-slide-up space-y-6">
          <div>
            <h2 className="text-2xl font-black text-[#eeeef8]">Your Sound</h2>
            <p className="mt-1 text-sm text-[#9090b0]">You can select more than one. The more you add, the more leads you get!</p>
          </div>

          {/* Genres */}
          <div className="rounded-2xl border border-josho-border bg-josho-surface p-5">
            <label className="mb-3 block text-sm font-bold text-[#eeeef8]">Genre</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button
                  key={g.slug}
                  type="button"
                  onClick={() => toggleItem(selectedGenres, g.slug, setSelectedGenres)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    selectedGenres.includes(g.slug)
                      ? "bg-electric text-white shadow-electric"
                      : "border border-josho-border text-[#9090b0] hover:border-josho-glow hover:text-[#eeeef8]"
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Instruments */}
          <div className="rounded-2xl border border-josho-border bg-josho-surface p-5">
            <label className="mb-3 block text-sm font-bold text-[#eeeef8]">Instrument / Skill</label>

            {(suggestedPrice !== null || suggestedLoading) && (
              <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-gold/30 bg-gold/8 px-4 py-3">
                {suggestedLoading ? (
                  <span className="text-xs text-[#9090b0]">Looking up regional rate...</span>
                ) : (
                  <>
                    <span className="text-xs text-[#eeeef8]">
                      Suggested rate in {city}:{" "}
                      <strong className="text-gold">₹{suggestedPrice?.toLocaleString("en-IN")}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setEventRate(String(suggestedPrice))}
                      className="rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold hover:bg-gold/30"
                    >
                      Use this rate
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {INSTRUMENTS.map((i) => (
                <button
                  key={i.slug}
                  type="button"
                  onClick={() => toggleItem(selectedInstruments, i.slug, setSelectedInstruments)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    selectedInstruments.includes(i.slug)
                      ? "bg-electric text-white shadow-electric"
                      : "border border-josho-border text-[#9090b0] hover:border-josho-glow hover:text-[#eeeef8]"
                  }`}
                >
                  {i.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button type="button" onClick={() => setStep(1)} className="text-sm text-[#9090b0] hover:text-[#eeeef8]">
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={selectedGenres.length === 0 || selectedInstruments.length === 0}
              className="btn-gold px-8 py-3 text-sm disabled:opacity-40"
            >
              Next: Showcase →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3 ──────────────────────────────── */}
      {step === 3 && (
        <div className="animate-slide-up space-y-5">
          <div>
            <h2 className="text-2xl font-black text-[#eeeef8]">Showcase Yourself</h2>
            <p className="mt-1 text-sm text-[#9090b0]">
              Clients look at this section when deciding. A solid profile means more bookings.
            </p>
          </div>

          {/* YouTube */}
          <div className="rounded-2xl border border-josho-border bg-josho-surface p-5">
            <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-[#eeeef8]">
              <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube Link (Strongly Recommended)
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Paste the link to your best performance"
              className="w-full rounded-xl border border-josho-border bg-josho-elevated px-4 py-3 text-sm text-[#eeeef8] placeholder:text-[#505070] outline-none focus:border-electric/60"
            />
            <p className="mt-1.5 text-[10px] text-[#505070]">
              A live performance video is most effective. A channel link is fine too.
            </p>
          </div>

          {/* Instagram */}
          <div className="rounded-2xl border border-josho-border bg-josho-surface p-5">
            <label className="mb-1.5 block text-sm font-bold text-[#eeeef8]">Instagram Handle</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#505070]">@</span>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ""))}
                placeholder="yourname"
                className="flex-1 rounded-xl border border-josho-border bg-josho-elevated px-4 py-3 text-sm text-[#eeeef8] placeholder:text-[#505070] outline-none focus:border-electric/60"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="rounded-2xl border border-josho-border bg-josho-surface p-5">
            <label className="mb-1.5 block text-sm font-bold text-[#eeeef8]">About You (Bio)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="e.g. I have been performing in Vasai for 5 years. Specializing in weddings and corporate events. Covering everything from Bollywood hits to classical."
              className="w-full rounded-xl border border-josho-border bg-josho-elevated px-4 py-3 text-sm text-[#eeeef8] placeholder:text-[#505070] outline-none focus:border-electric/60 resize-none"
            />
            <p className="mt-1 text-[10px] text-[#505070]">{bio.length}/300</p>
          </div>

          <div className="flex justify-between pt-2">
            <button type="button" onClick={() => setStep(2)} className="text-sm text-[#9090b0] hover:text-[#eeeef8]">
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="btn-gold px-8 py-3 text-sm"
            >
              Next: Gear →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: GEAR ────────────────────────── */}
      {step === 4 && (
        <div className="animate-slide-up space-y-6">
          <div>
            <h2 className="text-2xl font-black text-[#eeeef8]">Your Gear</h2>
            <p className="mt-1 text-sm text-[#9090b0]">
              Do you have extra gear you can rent out? It is fine to skip this step.
            </p>
          </div>

          <div className="rounded-2xl border border-josho-border bg-josho-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">💰</span>
              <div>
                <p className="text-sm font-bold text-[#eeeef8]">Earn extra income</p>
                <p className="text-xs text-[#9090b0]">Rent out your idle gear and earn ₹500–5,000 extra per day</p>
              </div>
            </div>

            <div className="space-y-3">
              {GEAR_ITEMS.map((gear) => {
                const isSelected = selectedGear.includes(gear.slug);
                return (
                  <div key={gear.slug}>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleItem(selectedGear, gear.slug, setSelectedGear)}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-all ${
                            isSelected
                              ? "border-electric bg-electric text-white"
                              : "border-josho-border text-transparent"
                          }`}
                        >
                          <span className="text-[10px]">✓</span>
                        </div>
                        <span className={`text-sm ${isSelected ? "text-[#eeeef8]" : "text-[#9090b0]"}`}>
                          {gear.name}
                        </span>
                      </button>
                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#505070]">₹</span>
                          <input
                            type="number"
                            value={gearRates[gear.slug] ?? ""}
                            onChange={(e) => setGearRates((r) => ({ ...r, [gear.slug]: e.target.value }))}
                            placeholder="Rate per day"
                            className="w-28 rounded-lg border border-josho-border bg-josho-elevated px-2 py-1.5 text-xs text-[#eeeef8] placeholder:text-[#505070] outline-none focus:border-electric/60"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={() => setStep(3)} className="text-sm text-[#9090b0] hover:text-[#eeeef8]">
              ← Back
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="text-sm text-[#505070] hover:text-[#9090b0]"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-gold px-8 py-3 text-sm disabled:opacity-50"
              >
                {submitting ? "Submitting profile..." : "Submit Profile →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DONE ────────────────────────────────── */}
      {step === "done" && (
        <div className="animate-slide-up rounded-2xl border border-teal/20 bg-teal/5 p-8 text-center sm:p-12">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-black text-[#eeeef8]">Profile submitted!</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#9090b0]">
            We will verify within 24 hours. Once verified, clients can discover you.
            A login link has been sent to your email.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="/discover"
              className="rounded-xl border border-teal/40 bg-teal/10 px-6 py-3 text-sm font-medium text-teal transition-all hover:bg-teal/20"
            >
              See How You Look →
            </a>
            <a
              href="/login"
              className="btn-electric px-6 py-3 text-sm"
            >
              Dashboard Login
            </a>
          </div>
        </div>
      )}
    </>
  );
}
