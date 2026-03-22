'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Heart, MessageCircle, Share2, Music, MapPin, Star,
  ChevronUp, ChevronDown, Play, Pause, Volume2, VolumeX,
  Bookmark, Calendar
} from 'lucide-react'

interface ReelArtist {
  id: string
  display_name: string
  categories: string[]
  city: string
  avg_rating: number
  base_rate_inr: number
  bio: string | null
  ai_generated_bio: string | null
  photo_urls: string[]
  video_preview_url: string | null
  audio_urls: string[]
  total_gigs: number
  is_online: boolean
  is_founder: boolean
}

function formatCurrency(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

function ReelCard({
  artist,
  isActive,
  onBook,
  onProfile,
}: {
  artist: ReelArtist
  isActive: boolean
  onBook: () => void
  onProfile: () => void
}) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showBio, setShowBio] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const hasVideo = !!artist.video_preview_url
  const heroImage = artist.photo_urls?.[0] || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(artist.display_name)}`
  const bio = artist.ai_generated_bio || artist.bio || ''
  const shortBio = bio.length > 80 ? bio.slice(0, 80) + '...' : bio

  // Auto-play video when active
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) videoRef.current.play().catch(() => {})
      else videoRef.current.pause()
    }
  }, [isActive])

  return (
    <div className="relative h-[100dvh] w-full snap-start snap-always flex-shrink-0 overflow-hidden bg-black">
      {/* Background */}
      {hasVideo ? (
        <video
          ref={videoRef}
          src={artist.video_preview_url!}
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
        />
      ) : (
        <div className="absolute inset-0">
          {/* Hero image with zoom animation */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-linear"
            style={{
              backgroundImage: `url(${heroImage})`,
              transform: isActive ? 'scale(1.15)' : 'scale(1)',
            }}
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>
      )}

      {/* Category pill (top left) */}
      <div className="absolute top-4 left-4 z-10 safe-top">
        <div className="flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1.5">
          <Music className="h-3 w-3 text-accent" />
          <span className="text-xs font-medium text-white capitalize">
            {artist.categories[0]?.replace('-', ' ')}
          </span>
        </div>
        {artist.is_online && (
          <div className="mt-2 flex items-center gap-1 rounded-full bg-green-500/20 backdrop-blur-sm px-2.5 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-green-300 font-medium">LIVE NOW</span>
          </div>
        )}
      </div>

      {/* Right action bar (Instagram-style) */}
      <div className="absolute right-3 bottom-32 z-10 flex flex-col items-center gap-5">
        {/* Profile avatar */}
        <button onClick={onProfile} className="relative">
          <div className="h-11 w-11 rounded-full border-2 border-white overflow-hidden">
            <img
              src={heroImage}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          {artist.is_founder && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-accent px-1.5 py-0.5 text-[8px] font-bold text-white">
              F
            </div>
          )}
        </button>

        {/* Like */}
        <button
          onClick={() => setLiked(!liked)}
          className="flex flex-col items-center gap-1"
        >
          <Heart
            className={`h-7 w-7 transition-all ${liked ? 'text-red-500 fill-red-500 scale-110' : 'text-white'}`}
          />
          <span className="text-[10px] text-white font-medium">{artist.total_gigs}</span>
        </button>

        {/* Book */}
        <button onClick={onBook} className="flex flex-col items-center gap-1">
          <Calendar className="h-7 w-7 text-white" />
          <span className="text-[10px] text-white font-medium">Book</span>
        </button>

        {/* Save */}
        <button
          onClick={() => setSaved(!saved)}
          className="flex flex-col items-center gap-1"
        >
          <Bookmark
            className={`h-7 w-7 transition-all ${saved ? 'text-amber-400 fill-amber-400' : 'text-white'}`}
          />
          <span className="text-[10px] text-white font-medium">Save</span>
        </button>

        {/* Share */}
        <button
          onClick={() => navigator.share?.({ title: artist.display_name, url: `/artists/${artist.id}` }).catch(() => {})}
          className="flex flex-col items-center gap-1"
        >
          <Share2 className="h-6 w-6 text-white" />
          <span className="text-[10px] text-white font-medium">Share</span>
        </button>
      </div>

      {/* Bottom info (Instagram-style) */}
      <div className="absolute bottom-0 left-0 right-14 z-10 p-4 pb-6 safe-bottom">
        {/* Artist name + rating */}
        <button onClick={onProfile} className="text-left">
          <h2 className="text-lg font-bold text-white leading-tight">
            {artist.display_name}
          </h2>
        </button>

        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs text-white font-medium">{artist.avg_rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-white/60" />
            <span className="text-xs text-white/80">{artist.city}</span>
          </div>
          <span className="text-xs text-accent font-semibold">
            {formatCurrency(artist.base_rate_inr)}
          </span>
        </div>

        {/* Bio (expandable) */}
        {bio && (
          <button onClick={() => setShowBio(!showBio)} className="mt-2 text-left">
            <p className="text-xs text-white/70 leading-relaxed">
              {showBio ? bio : shortBio}
              {bio.length > 80 && (
                <span className="text-white/50 ml-1">
                  {showBio ? ' less' : ' more'}
                </span>
              )}
            </p>
          </button>
        )}

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {artist.categories.slice(0, 3).map(c => (
            <span
              key={c}
              className="rounded-full bg-white/10 backdrop-blur-sm px-2.5 py-0.5 text-[10px] text-white/80 capitalize"
            >
              {c.replace('-', ' ')}
            </span>
          ))}
        </div>

        {/* Book CTA */}
        <button
          onClick={onBook}
          className="mt-3 w-full rounded-xl bg-accent hover:bg-accent/90 py-3 text-center text-sm font-bold text-white transition-colors"
        >
          Book {artist.display_name.split(' ')[0]} — {formatCurrency(artist.base_rate_inr)}
        </button>
      </div>

      {/* Audio visualizer bar (decorative) */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 flex gap-px">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="flex-1 bg-accent/60"
              style={{
                animation: `pulse ${0.3 + Math.random() * 0.7}s ease-in-out infinite alternate`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ReelsPage() {
  const router = useRouter()
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [artists, setArtists] = useState<ReelArtist[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const loadArtists = useCallback(async (pageNum: number) => {
    const { data } = await supabase
      .from('providers')
      .select('id, display_name, categories, city, avg_rating, base_rate_inr, bio, ai_generated_bio, photo_urls, video_preview_url, audio_urls, total_gigs, is_online, is_founder')
      .eq('status', 'verified')
      .order('avg_rating', { ascending: false })
      .range(pageNum * 10, (pageNum + 1) * 10 - 1)

    if (data) {
      if (data.length < 10) setHasMore(false)
      setArtists(prev => pageNum === 0 ? data : [...prev, ...data])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadArtists(0) }, [loadArtists])

  // Detect active reel via intersection observer
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-index'))
            setActiveIndex(idx)
            // Load more when near end
            if (idx >= artists.length - 3 && hasMore) {
              const nextPage = page + 1
              setPage(nextPage)
              loadArtists(nextPage)
            }
          }
        })
      },
      { root: container, threshold: 0.6 }
    )

    container.querySelectorAll('[data-index]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [artists.length, hasMore, page, loadArtists])

  if (loading) {
    return (
      <div className="h-[100dvh] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading artists...</p>
        </div>
      </div>
    )
  }

  if (artists.length === 0) {
    return (
      <div className="h-[100dvh] bg-black flex items-center justify-center p-6">
        <div className="text-center">
          <Music className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <h2 className="text-white text-lg font-bold">No artists yet</h2>
          <p className="text-white/50 text-sm mt-1">Check back soon for amazing performers</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[100dvh] w-full bg-black overflow-hidden">
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-none"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {artists.map((artist, i) => (
          <div key={artist.id} data-index={i}>
            <ReelCard
              artist={artist}
              isActive={i === activeIndex}
              onBook={() => router.push(`/book?provider=${artist.id}`)}
              onProfile={() => router.push(`/artists/${artist.id}`)}
            />
          </div>
        ))}

        {/* Loading more indicator */}
        {hasMore && (
          <div className="h-20 flex items-center justify-center bg-black snap-start">
            <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Top gradient for status bar */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-20" />

      {/* Scroll indicators */}
      <div className="fixed right-1.5 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1">
        {artists.slice(Math.max(0, activeIndex - 2), activeIndex + 3).map((_, i) => {
          const idx = Math.max(0, activeIndex - 2) + i
          return (
            <div
              key={idx}
              className={`w-1 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'h-6 bg-accent' : 'h-2 bg-white/30'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
