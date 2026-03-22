"use client";

interface PremiumUpsellModalProps {
  open: boolean;
  onClose: () => void;
  /** Reason for showing: e.g. "audio_only" | "single_media" | "no_video" */
  reason?: string;
}

const STUDIO_LANDING = "/studio";

export function PremiumUpsellModal({ open, onClose, reason = "single_media" }: PremiumUpsellModalProps) {
  if (!open) return null;

  const messages: Record<string, { title: string; body: string }> = {
    audio_only: {
      title: "Sound better on your profile",
      body: "Phone recordings work, but studio-quality audio gets more bookings. Record a track at our partner studio and stand out."
    },
    single_media: {
      title: "One clip is good — more is better",
      body: "Artists with multiple high-quality videos get 3x more inquiries. Add a studio-recorded track or music video to boost your profile."
    },
    no_video: {
      title: "Video drives bookings",
      body: "Organizers love seeing you perform. Add a YouTube video or book a quick studio session to record a professional clip."
    }
  };

  const { title, body } = messages[reason] ?? messages.single_media;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upsell-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative max-w-md rounded-2xl border border-amber-700/40 bg-gradient-to-br from-[#1a1a0a] to-[#0d1a30] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 text-4xl">&#127929;</div>
        <h2 id="upsell-title" className="text-xl font-bold text-white">
          {title}
        </h2>
        <p className="mt-2 text-sm text-blue-200">{body}</p>
        <div className="mt-6 flex gap-3">
          <a
            href={STUDIO_LANDING}
            className="flex-1 rounded-full bg-amber-500 px-4 py-2.5 text-center text-sm font-bold text-black hover:bg-amber-400"
          >
            Explore Studio Options
          </a>
          <button
            onClick={onClose}
            className="rounded-full border border-blue-700 px-4 py-2.5 text-sm text-blue-200 hover:bg-blue-900/30"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
