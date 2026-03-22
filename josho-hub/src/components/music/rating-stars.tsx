"use client";

interface RatingStarsProps {
  rating: number;
  max?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: "text-sm", md: "text-lg", lg: "text-2xl" };

export function RatingStars({ rating, max = 5, interactive = false, onChange, size = "md" }: RatingStarsProps) {
  return (
    <div className={`flex gap-0.5 ${sizeMap[size]}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(rating);
        return (
          <span
            key={i}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            onClick={() => interactive && onChange?.(i + 1)}
            onKeyDown={(e) => interactive && e.key === "Enter" && onChange?.(i + 1)}
            className={`${interactive ? "cursor-pointer" : ""} ${filled ? "text-amber-400" : "text-blue-800"}`}
          >
            &#9733;
          </span>
        );
      })}
    </div>
  );
}
