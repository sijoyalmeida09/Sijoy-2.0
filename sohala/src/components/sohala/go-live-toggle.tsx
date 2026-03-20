'use client'

import { useState } from 'react'
import { Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface GoLiveToggleProps {
  providerId: string
  initialIsLive?: boolean
  onToggle?: (isLive: boolean) => void
}

export function GoLiveToggle({ providerId, initialIsLive = false, onToggle }: GoLiveToggleProps) {
  const [isLive, setIsLive] = useState(initialIsLive)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const toggle = async () => {
    setLoading(true)
    const newState = !isLive

    try {
      // Get location if going live
      let location: { lat: number; lng: number } | undefined
      if (newState && navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
          )
          location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
        } catch {
          // Geolocation denied — continue without location
        }
      }

      const res = await fetch('/api/artists/go-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_online: newState,
          lat: location?.lat,
          lng: location?.lng,
        }),
      })

      if (res.ok) {
        setIsLive(newState)
        onToggle?.(newState)

        // Broadcast via Supabase Realtime
        if (newState) {
          await supabase.channel('gig_feed_events').send({
            type: 'broadcast',
            event: 'provider_online',
            payload: { provider_id: providerId, location },
          })
        }
      }
    } catch (err) {
      console.error('Go Live error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Big pulsing button */}
      <button
        onClick={toggle}
        disabled={loading}
        className={`
          relative h-24 w-24 rounded-full flex flex-col items-center justify-center gap-1
          font-bold text-sm transition-all duration-300 cursor-pointer
          disabled:opacity-70 disabled:cursor-not-allowed
          ${isLive
            ? 'bg-accent-green text-white shadow-[0_0_40px_rgba(0,200,83,0.5)] live-pulse'
            : 'bg-[#1a1a1a] border-2 border-white/20 text-text-muted hover:border-white/40 hover:text-white'
          }
        `}
      >
        {/* Radar rings when live */}
        {isLive && (
          <>
            <span className="absolute inset-0 rounded-full bg-accent-green opacity-30 radar-ping" />
            <span className="absolute inset-0 rounded-full bg-accent-green opacity-20 radar-ping-delay" />
          </>
        )}
        <Zap className={`h-6 w-6 ${isLive ? 'fill-white' : ''}`} />
        <span className="text-xs uppercase tracking-widest">
          {loading ? '...' : isLive ? 'Live' : 'Go Live'}
        </span>
      </button>

      {/* Status text */}
      <p className={`text-sm ${isLive ? 'text-accent-green font-semibold' : 'text-text-muted'}`}>
        {isLive
          ? 'You are live — accepting gigs in your area'
          : 'Go live to receive instant gig requests'}
      </p>
    </div>
  )
}
