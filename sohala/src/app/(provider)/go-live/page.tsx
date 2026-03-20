'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GoLiveToggle } from '@/components/sohala/go-live-toggle'
import { CountdownRing } from '@/components/sohala/countdown-ring'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, DollarSign, Zap } from 'lucide-react'
import { InstantGig } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function GoLivePage() {
  const supabase = createClient()
  const [providerId, setProviderId] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [incomingGigs, setIncomingGigs] = useState<InstantGig[]>([])
  const [acceptedGig, setAcceptedGig] = useState<InstantGig | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: provider } = await supabase
        .from('providers')
        .select('id, is_online')
        .eq('profile_id', user.id)
        .single()

      if (provider) {
        setProviderId(provider.id)
        setIsLive(provider.is_online)
      }
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isLive || !providerId) return

    // Subscribe to instant gig broadcasts
    const channel = supabase
      .channel(`provider_gigs_${providerId}`)
      .on('broadcast', { event: 'instant_gig' }, ({ payload }) => {
        setIncomingGigs((prev) => [payload as InstantGig, ...prev].slice(0, 5))
      })
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [isLive, providerId]) // eslint-disable-line react-hooks/exhaustive-deps

  const acceptGig = async (gig: InstantGig) => {
    const res = await fetch(`/api/gigs/instant/${gig.id}/accept`, {
      method: 'POST',
    })
    if (res.ok) {
      setAcceptedGig(gig)
      setIncomingGigs((prev) => prev.filter((g) => g.id !== gig.id))
    }
  }

  const skipGig = (gigId: string) => {
    setIncomingGigs((prev) => prev.filter((g) => g.id !== gigId))
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-start py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Live Gig Radar</h1>
        <p className="text-text-secondary">Go live to receive instant gig requests from nearby clients</p>
      </div>

      {/* Radar + Go Live Toggle */}
      <div className="relative flex items-center justify-center">
        {/* Radar rings */}
        {isLive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-64 w-64 rounded-full border border-accent-green/20 absolute radar-ping" />
            <div className="h-48 w-48 rounded-full border border-accent-green/30 absolute radar-ping-delay" />
            <div className="h-32 w-32 rounded-full border border-accent-green/40 absolute" />
          </div>
        )}

        {/* SVG Radar circle */}
        <svg
          width="300"
          height="300"
          className={`transition-opacity duration-500 ${isLive ? 'opacity-100' : 'opacity-30'}`}
        >
          {/* Radar grid circles */}
          {[40, 80, 120, 140].map((r) => (
            <circle
              key={r}
              cx="150"
              cy="150"
              r={r}
              fill="none"
              stroke={isLive ? 'rgba(0, 200, 83, 0.15)' : 'rgba(255,255,255,0.05)'}
              strokeWidth="1"
            />
          ))}
          {/* Cross lines */}
          <line x1="10" y1="150" x2="290" y2="150" stroke={isLive ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.04)'} />
          <line x1="150" y1="10" x2="150" y2="290" stroke={isLive ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.04)'} />
          {/* Rotating sweep line */}
          {isLive && (
            <line
              x1="150"
              y1="150"
              x2="150"
              y2="10"
              stroke="rgba(0,200,83,0.5)"
              strokeWidth="2"
              style={{
                transformOrigin: '150px 150px',
                animation: 'spin 3s linear infinite',
              }}
            />
          )}
          {/* Incoming gig dots on radar */}
          {isLive && incomingGigs.map((gig, i) => (
            <g key={gig.id}>
              <circle
                cx={150 + (i % 2 === 0 ? 60 : -60) * (1 + i * 0.2)}
                cy={150 - 40 - i * 15}
                r="5"
                fill="#E50914"
                className="animate-pulse"
              />
            </g>
          ))}
        </svg>

        {/* Center Toggle */}
        <div className="absolute">
          {providerId && (
            <GoLiveToggle
              providerId={providerId}
              initialIsLive={isLive}
              onToggle={setIsLive}
            />
          )}
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        <Badge variant={isLive ? 'live' : 'default'} className="text-sm px-4 py-1">
          {isLive ? 'Broadcasting your availability' : 'Offline'}
        </Badge>
        {isLive && (
          <p className="text-text-muted text-sm mt-2">
            Waiting for gig requests in your area...
          </p>
        )}
      </div>

      {/* Accepted Gig */}
      <AnimatePresence>
        {acceptedGig && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md bg-accent-green/10 border border-accent-green/30 rounded-3xl p-6 text-center"
          >
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="font-bold text-white text-lg mb-1">Gig Accepted!</h3>
            <p className="text-text-secondary text-sm mb-3">
              {acceptedGig.event_type} · {new Date(acceptedGig.start_time).toLocaleTimeString()}
            </p>
            <div className="text-xl font-bold text-accent-green">
              {formatCurrency(acceptedGig.provider_payout_inr)}
            </div>
            <Button variant="green" size="md" className="mt-4 w-full" onClick={() => setAcceptedGig(null)}>
              View Booking Details
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incoming Gig Cards */}
      <AnimatePresence>
        {isLive && incomingGigs.length > 0 && (
          <div className="w-full max-w-md space-y-3">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              Incoming Gig Requests
            </h3>
            {incomingGigs.map((gig) => (
              <motion.div
                key={gig.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-card border border-accent/20 rounded-2xl p-4"
              >
                <div className="flex items-start gap-3">
                  <CountdownRing seconds={60} onExpire={() => skipGig(gig.id)} size={64} strokeWidth={4} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white capitalize">{gig.event_type}</div>
                    <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{gig.location_text}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(gig.start_time).toLocaleTimeString()} · {gig.duration_hours}h</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-accent-gold font-bold mt-1">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(gig.provider_payout_inr)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="primary" size="sm" className="flex-1" onClick={() => acceptGig(gig)}>
                    Accept
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => skipGig(gig.id)}>
                    Skip
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Idle State */}
      {isLive && incomingGigs.length === 0 && !acceptedGig && (
        <div className="text-center text-text-muted">
          <Zap className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No gigs right now — stay live and we'll notify you instantly</p>
        </div>
      )}

      {/* CSS for radar spin */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
