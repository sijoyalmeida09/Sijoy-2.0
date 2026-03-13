"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

export interface MediaItem {
  id: string;
  media_type: "image" | "video" | "audio" | "youtube";
  url: string;
  thumbnail: string | null;
  title: string | null;
  sort_order: number;
}

interface MediaCarouselProps {
  items: MediaItem[];
  className?: string;
}

function MediaSlide({ item }: { item: MediaItem }) {
  if (item.media_type === "youtube") {
    const embedUrl = item.url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/");
    return (
      <div className="relative min-w-0 flex-[0_0_100%] overflow-hidden rounded-lg bg-[#0d1a30]">
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            allowFullScreen
            title={item.title ?? "YouTube video"}
          />
        </div>
        {item.title && (
          <p className="px-3 py-2 text-xs text-blue-200">{item.title}</p>
        )}
      </div>
    );
  }

  if (item.media_type === "image") {
    return (
      <div className="relative min-w-0 flex-[0_0_100%] overflow-hidden rounded-lg bg-[#0d1a30]">
        <img
          src={item.url}
          alt={item.title ?? ""}
          className="aspect-video w-full object-cover"
        />
        {item.title && (
          <p className="px-3 py-2 text-xs text-blue-200">{item.title}</p>
        )}
      </div>
    );
  }

  if (item.media_type === "video") {
    return (
      <div className="relative min-w-0 flex-[0_0_100%] overflow-hidden rounded-lg bg-[#0d1a30]">
        <video
          src={item.url}
          controls
          className="aspect-video w-full object-contain"
          poster={item.thumbnail ?? undefined}
        />
        {item.title && (
          <p className="px-3 py-2 text-xs text-blue-200">{item.title}</p>
        )}
      </div>
    );
  }

  if (item.media_type === "audio") {
    return (
      <div className="relative min-w-0 flex-[0_0_100%] overflow-hidden rounded-lg bg-[#0d1a30]">
        <div className="flex aspect-video min-h-[120px] items-center justify-center p-4">
          <audio controls src={item.url} className="w-full max-w-md" />
        </div>
        {item.title && (
          <p className="px-3 py-2 text-xs text-blue-200">{item.title}</p>
        )}
      </div>
    );
  }

  return null;
}

export function MediaCarousel({ items, className = "" }: MediaCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: items.length > 1,
    align: "start",
    containScroll: "trimSnaps"
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  if (items.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y gap-3">
          {items.map((item) => (
            <MediaSlide key={item.id} item={item} />
          ))}
        </div>
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 disabled:opacity-30"
            aria-label="Previous"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 disabled:opacity-30"
            aria-label="Next"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="mt-3 flex justify-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-2 rounded-full transition ${
                  i === selectedIndex ? "w-6 bg-joshoBlue" : "w-2 bg-blue-600/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
