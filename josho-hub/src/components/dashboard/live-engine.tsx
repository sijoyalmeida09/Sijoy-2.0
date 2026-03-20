"use client";

import { useState } from "react";
import { GoLiveToggle } from "./go-live-toggle";
import { GigRadar } from "./gig-radar";

interface LiveEngineProps {
  artistId: string;
  city: string;
  initialOnline: boolean;
}

/**
 * Wrapper that syncs online state between GoLiveToggle and GigRadar.
 * GigRadar only subscribes to the Realtime channel when the artist is online.
 */
export function LiveEngine({ artistId, city, initialOnline }: LiveEngineProps) {
  const [isOnline, setIsOnline] = useState(initialOnline);

  return (
    <>
      <GoLiveToggle
        artistId={artistId}
        initialOnline={initialOnline}
        city={city}
        onToggle={setIsOnline}
      />
      <GigRadar artistId={artistId} city={city} isOnline={isOnline} />
    </>
  );
}
