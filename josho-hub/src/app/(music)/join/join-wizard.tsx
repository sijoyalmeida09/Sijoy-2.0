"use client";

import { useState, useEffect, useRef } from "react";
import { PremiumUpsellModal } from "@/components/music/premium-upsell-modal";

const GENRES = [
  { slug: "vasaikar", name: "Vasaikar / Konkani Folk" },
  { slug: "bollywood", name: "Bollywood" },
  { slug: "sufi", name: "Sufi / Qawwali" },
  { slug: "western", name: "Western / Pop / Rock" },
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

type Step = 1 | 2 | 3 | "done";

export function JoinWizard() {
  const [step, setStep] = useState<Step>(1);

  const [stageName, setStageName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Vasai-Virar");
  const [bio, setBio] = useState("");
  const [eventRate, setEventRate] = useState("");

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);

  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"youtube" | "audio" | "image">("youtube");

  const [submitting, setSubmitting] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [suggestedLoading, setSuggestedLoading] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const upsellShown = useRef(false);

  useEffect(() => {
    if (selectedInstruments.length === 0) {
      setSuggestedPrice(null);
      return;
    }
    setSuggestedLoading(true);
    fetch(
      `/api/artists/suggested-price?instruments=${selectedInstruments.join(",")}&region=${encodeURIComponent(city)}`
    )
      .then((r) => r.json())
      .then((d) => setSuggestedPrice(d.suggested ?? null))
      .catch(() => setSuggestedPrice(null))
      .finally(() => setSuggestedLoading(false));
  }, [selectedInstruments, city]);

  function toggleItem(list: string[], item: string, setter: (v: string[]) => void) {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }

  function shouldShowUpsell(): boolean {
    if (upsellShown.current) return false;
    if (mediaType === "audio" && mediaUrl) return true;
    if (mediaType === "image" && mediaUrl) return true;
    if (!mediaUrl) return false;
    return false;
  }

  async function handleSubmit() {
    if (shouldShowUpsell()) {
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
          stageName,
          email,
          phone,
          city,
          bio,
          eventRate: eventRate ? Number(eventRate) : null,
          genres: selectedGenres,
          instruments: selectedInstruments,
          mediaUrl: mediaUrl || null,
          mediaType
        })
      });
      if (!res.ok) throw new Error("Registration failed");
      setStep("done");
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Progress */}
      {step !== "done" && (
        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  step === s ? "bg-joshoBlue text-white" : step > s ? "bg-green-700 text-white" : "bg-blue-900/40 text-blue-500"
                }`}
              >
                {(step as number) > s ? "&#10003;" : s}
              </div>
              {s < 3 && <div className="h-px w-8 bg-blue-900/40" />}
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Who are you */}
      {step === 1 && (
        <section className="space-y-4 rounded-xl border border-blue-900/30 bg-[#13213d] p-5">
          <h2 className="text-lg font-bold text-white">Step 1: Who are you?</h2>
          <p className="text-xs text-blue-300">Takes 30 seconds. Just the basics.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-blue-200">Stage Name / Band Name</label>
              <input type="text" value={stageName} onChange={(e) => setStageName(e.target.value)} placeholder="e.g. DJ Ravi, The Vasaikar Band" className="w-full rounded-lg border border-blue-800/40 bg-[#0d1a30] px-3 py-2 text-sm text-white outline-none ring-joshoBlue placeholder:text-blue-700 focus:ring-2" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-blue-200">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full rounded-lg border border-blue-800/40 bg-[#0d1a30] px-3 py-2 text-sm text-white outline-none ring-joshoBlue placeholder:text-blue-700 focus:ring-2" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-blue-200">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full rounded-lg border border-blue-800/40 bg-[#0d1a30] px-3 py-2 text-sm text-white outline-none ring-joshoBlue placeholder:text-blue-700 focus:ring-2" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-blue-200">City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-lg border border-blue-800/40 bg-[#0d1a30] px-3 py-2 text-sm text-white outline-none ring-joshoBlue focus:ring-2" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-blue-200">Short Bio (optional)</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} placeholder="Tell organizers about yourself in 2-3 lines..." className="w-full rounded-lg border border-blue-800/40 bg-[#0d1a30] px-3 py-2 text-sm text-white outline-none ring-joshoBlue placeholder:text-blue-700 focus:ring-2" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-blue-200">Rate per event (optional, in &#8377;)</label>
            <input type="number" value={eventRate} onChange={(e) => setEventRate(e.target.value)} placeholder="e.g. 5000" className="w-full rounded-lg border border-blue-800/40 bg-[#0d1a30] px-3 py-2 text-sm text-white outline-none ring-joshoBlue placeholder:text-blue-700 focus:ring-2 sm:w-48" />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => setStep(2)} disabled={!stageName || !email} className="rounded-full bg-joshoBlue px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40">
              Next: Pick Your Sound
            </button>
          </div>
        </section>
      )}

      {/* Step 2: Genres + Instruments */}
      {step === 2 && (
        <section className="space-y-5 rounded-xl border border-blue-900/30 bg-[#13213d] p-5">
          <h2 className="text-lg font-bold text-white">Step 2: Pick your sound</h2>
          <p className="text-xs text-blue-300">Select all that apply. 15 seconds.</p>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-blue-200">Genres</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button
                  key={g.slug}
                  type="button"
                  onClick={() => toggleItem(selectedGenres, g.slug, setSelectedGenres)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    selectedGenres.includes(g.slug)
                      ? "bg-joshoBlue text-white"
                      : "border border-blue-800/40 text-blue-300 hover:border-joshoBlue/60"
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-blue-200">Instruments / Skills</label>
            {(suggestedPrice !== null || suggestedLoading) && (
              <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-amber-700/40 bg-amber-900/20 px-3 py-2">
                {suggestedLoading ? (
                  <span className="text-xs text-amber-200">Loading suggested rate...</span>
                ) : (
                  <>
                    <span className="text-xs text-amber-200">
                      Regional median for your instruments in {city}: <strong className="text-amber-100">&#8377;{suggestedPrice?.toLocaleString("en-IN")}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setEventRate(String(suggestedPrice))}
                      className="rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-black hover:bg-amber-500"
                    >
                      Use suggested rate
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
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    selectedInstruments.includes(i.slug)
                      ? "bg-joshoBlue text-white"
                      : "border border-blue-800/40 text-blue-300 hover:border-joshoBlue/60"
                  }`}
                >
                  {i.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="text-sm text-blue-300 hover:text-white">&larr; Back</button>
            <button type="button" onClick={() => setStep(3)} disabled={selectedGenres.length === 0 || selectedInstruments.length === 0} className="rounded-full bg-joshoBlue px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40">
              Next: Add Media
            </button>
          </div>
        </section>
      )}

      {/* Step 3: Upload media */}
      {step === 3 && (
        <section className="space-y-4 rounded-xl border border-blue-900/30 bg-[#13213d] p-5">
          <h2 className="text-lg font-bold text-white">Step 3: Show your talent</h2>
          <p className="text-xs text-blue-300">Add at least one video, audio clip, or YouTube link. You can add more later.</p>

          <div>
            <label className="mb-1 block text-xs font-medium text-blue-200">Media Type</label>
            <div className="flex gap-2">
              {(["youtube", "audio", "image"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMediaType(t)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                    mediaType === t ? "bg-joshoBlue text-white" : "border border-blue-800/40 text-blue-300"
                  }`}
                >
                  {t === "youtube" ? "YouTube Link" : t === "audio" ? "Audio URL" : "Image URL"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-blue-200">
              {mediaType === "youtube" ? "YouTube Video or Channel URL" : mediaType === "audio" ? "Audio File URL" : "Image URL"}
            </label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder={mediaType === "youtube" ? "Video: youtube.com/watch?v=... or Channel: youtube.com/@username" : "https://..."}
              className="w-full rounded-lg border border-blue-800/40 bg-[#0d1a30] px-3 py-2 text-sm text-white outline-none ring-joshoBlue placeholder:text-blue-700 focus:ring-2"
            />
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(2)} className="text-sm text-blue-300 hover:text-white">&larr; Back</button>
            <PremiumUpsellModal
              open={showUpsell}
              onClose={() => setShowUpsell(false)}
              reason={mediaType === "audio" ? "audio_only" : mediaType === "image" ? "no_video" : "single_media"}
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-full bg-green-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-green-500 disabled:opacity-50"
            >
              {submitting ? "Creating Profile..." : "Create My Profile"}
            </button>
          </div>
        </section>
      )}

      {/* Done */}
      {step === "done" && (
        <section className="rounded-2xl border border-green-700/30 bg-[#0d2818] p-8 text-center">
          <div className="text-5xl">&#127928;</div>
          <h2 className="mt-4 text-2xl font-bold text-white">Welcome to Vasaikar Live!</h2>
          <p className="mt-2 text-sm text-green-200">
            Your profile is submitted for review. Once verified, organizers will discover and book you.
            Check your email for a login link to access your dashboard.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="/discover" className="rounded-full border border-green-600 px-5 py-2 text-sm text-green-200 hover:bg-green-900/30">
              See How You Look
            </a>
            <a href="/login" className="rounded-full bg-joshoBlue px-5 py-2 text-sm font-bold text-white hover:opacity-90">
              Login to Dashboard
            </a>
          </div>
        </section>
      )}
    </>
  );
}
