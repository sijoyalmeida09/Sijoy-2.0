'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Provider } from '@/types'
import { ArtistCard } from '@/components/sohala/artist-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Zap, MapPin, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function TonightPage() {
  const supabase = createClient()
  const [liveArtists, setLiveArtists] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const fetchLiveArtists = async () => {
    const { data } = await supabase
      .from('providers')
      .select('*')
      .eq('status', 'verified')
      .eq('is_online', true)
      .order('avg_rating', { ascending: false })
    setLiveArtists((data ?? []) as Provider[])
    setLastUpdated(new Date())
    setLoading(false)
  }

  useEffect(() => {
    fetchLiveArtists()

    // Realtime subscription
    const channel = supabase
      .channel('live_providers')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'providers', filter: 'is_online=eq.true' },
        () => fetchLiveArtists()
      )
      .subscribe()

    // Refresh every 30 seconds
    const refreshInterval = setInterval(fetchLiveArtists, 30000)

    return () => {
      channel.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="h-4 w-4 rounded-full bg-accent-green" />
                <div className="absolute inset-0 rounded-full bg-accent-green animate-ping opacity-75" />
              </div>
              <h1 className="text-3xl font-bold text-white">Live Tonight</h1>
              <Badge variant="live">{liveArtists.length} Online</Badge>
            </div>
            <p className="text-text-secondary">
              Artists available for instant booking right now. Updated live.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchLiveArtists}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Last updated */}
        <p className="text-xs text-text-muted mb-6">
          Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
        </p>

        {/* Map placeholder (shows pulsing dots) */}
        <div className="relative bg-card-hover border border-white/5 rounded-3xl h-48 mb-8 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-text-muted text-sm">Interactive map coming soon</p>
          </div>
          {/* Pulsing dots to simulate artists on map */}
          {liveArtists.slice(0, 8).map((artist, i) => (
            <div
              key={artist.id}
              className="absolute"
              style={{
                left: `${15 + (i * 11) % 70}%`,
                top: `${20 + (i * 17) % 60}%`,
              }}
            >
              <div className="relative h-3 w-3">
                <div className="absolute inset-0 rounded-full bg-accent-green opacity-75 animate-ping" />
                <div className="relative rounded-full h-3 w-3 bg-accent-green" />
              </div>
            </div>
          ))}
        </div>

        {/* Live Artists Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden border border-white/5">
                <div className="aspect-video skeleton" />
                <div className="p-3 space-y-2">
                  <div className="h-4 skeleton rounded w-3/4" />
                  <div className="h-3 skeleton rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : liveArtists.length > 0 ? (
          <AnimatePresence>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {liveArtists.map((artist, i) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ArtistCard provider={artist} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-20">
            <div className="h-16 w-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-text-muted" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No artists online right now</h3>
            <p className="text-text-muted mb-6">
              Check back later or browse all artists to book in advance.
            </p>
            <Button variant="primary" onClick={() => (window.location.href = '/discover')}>
              Browse All Artists
            </Button>
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-12 p-6 bg-card border border-accent-green/20 rounded-3xl flex items-start gap-4">
          <div className="h-10 w-10 bg-accent-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <MapPin className="h-5 w-5 text-accent-green" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">Go Live as an Artist</h3>
            <p className="text-text-secondary text-sm">
              Are you an artist? Go live in your provider dashboard to appear on this feed and receive instant gig requests from clients nearby.
            </p>
            <Button variant="green" size="sm" className="mt-3" onClick={() => (window.location.href = '/provider/go-live')}>
              Go Live Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
