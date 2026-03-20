'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Zap, Crown, Star } from 'lucide-react'
import { Provider } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

// Supports both naming conventions: provider= (carousels) and artist= (living canvas)
interface ArtistCardProps {
  provider?: Provider
  artist?: Provider
  compact?: boolean
  className?: string
}

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=225&fit=crop',
  'https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?w=400&h=225&fit=crop',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=225&fit=crop',
  'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=225&fit=crop',
]

export function ArtistCard({ provider, artist, compact = false, className }: ArtistCardProps) {
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Accept either prop name
  const p = provider ?? artist
  if (!p) return null

  const categories = p.categories ?? []
  const avgRating = p.avg_rating ?? 0
  const baseRate = p.base_rate_inr ?? 0
  const totalGigs = p.total_gigs ?? 0

  const imageUrl =
    !imgError && p.photo_urls?.[0]
      ? p.photo_urls[0]
      : PLACEHOLDER_IMAGES[Math.abs(p.id.charCodeAt(0)) % PLACEHOLDER_IMAGES.length]

  // ── COMPACT MODE: 3:4 portrait mini-card for grid layouts ──
  if (compact) {
    return (
      <Link href={`/artists/${p.id}`} className="block">
        <div
          className={`relative rounded-xl overflow-hidden bg-[#1A1A1A] border border-white/5 group cursor-pointer aspect-[3/4] ${className ?? ''}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Photo */}
          <Image
            src={imageUrl}
            alt={p.display_name}
            fill
            className={`object-cover transition-transform duration-500 ${hovered ? 'scale-110' : 'scale-100'}`}
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />

          {/* Video preview on hover */}
          {hovered && p.video_preview_url && (
            <video
              src={p.video_preview_url}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {p.is_founder && (
              <Badge variant="founder" className="text-[10px] px-1.5 py-0.5">
                <Crown className="h-2 w-2" />
              </Badge>
            )}
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <h3 className="font-semibold text-white text-xs truncate group-hover:text-[#E50914] transition-colors">
              {p.display_name}
            </h3>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[10px] text-[#B3B3B3] capitalize truncate flex-1">
                {categories[0]?.replace(/-/g, ' ')}
              </span>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <Star className="h-2.5 w-2.5 text-[#FFD700] fill-[#FFD700]" />
                <span className="text-[10px] font-bold text-[#FFD700]">{avgRating.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-xs font-bold text-white">{formatCurrency(baseRate)}</div>
              {p.is_online && (
                <span className="flex items-center gap-0.5 text-[10px] text-[#00C853]">
                  <Zap className="h-2.5 w-2.5" />
                  Live
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // ── FULL MODE: landscape card for carousels ──
  return (
    <Link href={`/artists/${p.id}`}>
      <div
        className={`artist-card bg-card rounded-2xl overflow-hidden border border-white/5 group cursor-pointer ${className ?? ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image / Video */}
        <div className="relative aspect-video overflow-hidden bg-card-hover">
          <Image
            src={imageUrl}
            alt={p.display_name}
            fill
            className={`object-cover transition-transform duration-500 ${hovered ? 'scale-110' : 'scale-100'}`}
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
          />

          {/* Video preview on hover */}
          {hovered && p.video_preview_url && (
            <video
              src={p.video_preview_url}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {p.is_online && <Badge variant="live">Live</Badge>}
            {p.is_founder && (
              <Badge variant="founder">
                <Crown className="h-2.5 w-2.5" />
                Founder
              </Badge>
            )}
          </div>

          {/* Rating on image */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <Star className="h-3 w-3 text-accent-gold fill-accent-gold" />
            <span className="text-xs font-bold text-accent-gold">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-white/60">({totalGigs})</span>
          </div>

          {/* Book Now hover button */}
          <div
            className={`absolute bottom-2 right-2 transition-all duration-200 ${
              hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <Button variant="primary" size="sm" className="text-xs py-1 px-3">
              Book Now
            </Button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm truncate group-hover:text-accent-gold transition-colors">
                {p.display_name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-text-muted capitalize">
                  {categories[0]?.replace(/-/g, ' ')}
                </span>
                {p.is_online && (
                  <Zap className="h-3 w-3 text-accent-green flex-shrink-0" />
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-bold text-white">{formatCurrency(baseRate)}</div>
              <div className="text-xs text-text-muted">onwards</div>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-2">
            <MapPin className="h-3 w-3 text-text-muted flex-shrink-0" />
            <span className="text-xs text-text-muted truncate">
              {p.city}, {p.state}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
