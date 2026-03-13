"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RatingStars } from "@/components/music/rating-stars";

export function ReviewForm({ bookingId, revieweeId }: { bookingId: string; revieweeId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, revieweeId, rating, comment })
      });
      if (!res.ok) throw new Error("Failed");
      setDone(true);
      router.refresh();
    } catch {
      alert("Could not submit review. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-green-700/30 bg-[#0d2818] p-4 text-center">
        <p className="text-sm font-medium text-green-200">Thank you for your review!</p>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-amber-700/30 bg-[#1a2210] p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-400">Leave a Review</h3>
      <div className="space-y-3">
        <div>
          <p className="mb-1 text-xs text-amber-200">Rating</p>
          <RatingStars rating={rating} interactive onChange={setRating} size="lg" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-amber-200">Comment (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="How was the performance?"
            className="w-full rounded-lg border border-amber-800/40 bg-[#0d1a30] px-3 py-2 text-sm text-white outline-none ring-amber-600 placeholder:text-blue-700 focus:ring-2"
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="rounded-full bg-amber-600 px-6 py-2 text-sm font-bold text-black hover:bg-amber-500 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </section>
  );
}
