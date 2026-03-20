import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Provider, Review } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin, Clock, Star, Shield, Zap, Crown, Music,
  Calendar, MessageCircle, ChevronRight, Users, Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RatingStars } from '@/components/sohala/rating-stars'
import { ArtistCard } from '@/components/sohala/artist-card'
import { formatCurrency } from '@/lib/utils'

export default async function ArtistProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!provider) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, client:clients(profile:profiles(full_name, avatar_url))')
    .eq('provider_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: relatedArtists } = await supabase
    .from('providers')
    .select('*')
    .eq('status', 'verified')
    .neq('id', params.id)
    .contains('categories', provider.categories?.slice(0, 1) ?? [])
    .eq('city', provider.city)
    .limit(6)

  const p = provider as Provider
  const bio = p.ai_generated_bio || p.bio || 'No bio available.'
  const coverImage = p.photo_urls?.[0] ?? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=400&fit=crop'

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <Image
          src={coverImage}
          alt={p.display_name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Link href="/discover">
            <Button variant="secondary" size="sm">← Back</Button>
          </Link>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-2xl overflow-hidden border-4 border-primary flex-shrink-0 bg-card">
              {p.photo_urls?.[0] ? (
                <Image src={p.photo_urls[0]} alt={p.display_name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="h-10 w-10 text-text-muted" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {p.is_online && <Badge variant="live">Live Now</Badge>}
                {p.is_founder && <Badge variant="founder"><Crown className="h-2.5 w-2.5" />Founder</Badge>}
                {p.status === 'verified' && <Badge variant="verified"><Shield className="h-2.5 w-2.5" />Verified</Badge>}
              </div>
              <h1 className="text-3xl font-bold text-white">{p.display_name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <RatingStars rating={p.avg_rating} count={p.total_gigs} size="md" />
                <div className="flex items-center gap-1 text-text-secondary text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  {p.city}, {p.state}
                </div>
                <div className="flex items-center gap-1 text-text-secondary text-sm capitalize">
                  <Music className="h-3.5 w-3.5" />
                  {p.categories?.[0]?.replace(/-/g, ' ')}
                </div>
              </div>
            </div>

            {/* Book Now */}
            <div className="flex gap-3">
              <Link href={`/book?provider=${p.id}`}>
                <Button variant="primary" size="lg">
                  Book Now
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="secondary" size="lg">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Bio */}
            <div className="bg-card border border-white/5 rounded-2xl p-6">
              <h2 className="font-bold text-white mb-3">About</h2>
              <p className="text-text-secondary leading-relaxed">{bio}</p>
            </div>

            {/* Media Gallery */}
            {(p.photo_urls?.length > 1 || p.audio_urls?.length > 0) && (
              <div className="bg-card border border-white/5 rounded-2xl p-6">
                <h2 className="font-bold text-white mb-4">Media</h2>
                {p.photo_urls?.length > 1 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {p.photo_urls.slice(1, 7).map((url, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden relative">
                        <Image src={url} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                {p.audio_urls?.length > 0 && (
                  <div className="space-y-2">
                    {p.audio_urls.map((url, i) => (
                      <div key={i} className="bg-card-hover rounded-xl p-3">
                        <audio controls src={url} className="w-full h-8" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            <div className="bg-card border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white">Reviews</h2>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent-gold fill-accent-gold" />
                  <span className="font-bold text-white">{p.avg_rating.toFixed(1)}</span>
                  <span className="text-text-muted text-sm">({p.total_gigs} reviews)</span>
                </div>
              </div>

              {/* Rating Breakdown */}
              <div className="space-y-1.5 mb-6">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = (reviews as Review[] ?? []).filter((r) => Math.round(r.rating) === stars).length
                  const pct = reviews?.length ? (count / reviews.length) * 100 : 0
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="text-xs text-text-muted w-4">{stars}</span>
                      <Star className="h-3 w-3 text-accent-gold fill-accent-gold" />
                      <div className="flex-1 bg-white/10 rounded-full h-1.5">
                        <div
                          className="bg-accent-gold h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-muted w-4">{count}</span>
                    </div>
                  )
                })}
              </div>

              {/* Review List */}
              <div className="space-y-4">
                {(reviews as Review[] ?? []).length > 0 ? (
                  (reviews as Review[]).map((review) => (
                    <div key={review.id} className="border-t border-white/5 pt-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-card-hover flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {(review as any).client?.profile?.full_name?.slice(0, 2)?.toUpperCase() ?? '??'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white text-sm">
                              {(review as any).client?.profile?.full_name ?? 'Anonymous'}
                            </span>
                            <RatingStars rating={review.rating} showCount={false} size="sm" />
                          </div>
                          {review.title && (
                            <p className="font-medium text-text-secondary text-sm mt-1">{review.title}</p>
                          )}
                          <p className="text-text-muted text-sm mt-1 leading-relaxed">{review.body}</p>
                          {review.is_verified && (
                            <span className="text-xs text-accent-green mt-1 flex items-center gap-1">
                              <Shield className="h-3 w-3" />Verified Booking
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-text-muted text-sm text-center py-4">No reviews yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="bg-card border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-white">Quick Info</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-sm flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    Response Rate
                  </span>
                  <span className="font-semibold text-accent-green text-sm">
                    {p.response_rate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-sm flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Total Gigs
                  </span>
                  <span className="font-semibold text-white text-sm">{p.total_gigs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-sm flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    Travel Radius
                  </span>
                  <span className="font-semibold text-white text-sm">{p.travel_radius_km} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-sm flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5" />
                    Languages
                  </span>
                  <span className="font-semibold text-white text-sm">
                    {p.languages?.slice(0, 2).join(', ')}
                  </span>
                </div>
                {p.is_online && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-sm flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5" />
                      Status
                    </span>
                    <Badge variant="live">Available Now</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-card border border-white/5 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-3">Pricing</h3>
              <div className="text-3xl font-bold text-white mb-1">
                {formatCurrency(p.base_rate_inr)}
              </div>
              <div className="text-text-muted text-sm mb-4">starting price</div>
              {p.hourly_rate_inr && (
                <div className="text-sm text-text-secondary mb-4">
                  {formatCurrency(p.hourly_rate_inr)}/hour
                </div>
              )}
              <Link href={`/book?provider=${p.id}`} className="block">
                <Button variant="primary" size="lg" className="w-full">
                  Request Quote
                </Button>
              </Link>
              <p className="text-xs text-text-muted text-center mt-2">
                No payment until you accept the quote
              </p>
            </div>

            {/* Categories */}
            {p.categories?.length > 0 && (
              <div className="bg-card border border-white/5 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-3">Specialities</h3>
                <div className="flex flex-wrap gap-2">
                  {p.categories.map((cat) => (
                    <span
                      key={cat}
                      className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-text-secondary capitalize"
                    >
                      {cat.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Instruments */}
            {(p.instruments?.length ?? 0) > 0 && (
              <div className="bg-card border border-white/5 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-3">Instruments</h3>
                <div className="flex flex-wrap gap-2">
                  {(p.instruments ?? []).map((inst) => (
                    <span
                      key={inst}
                      className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-text-secondary"
                    >
                      {inst}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Artists */}
        {relatedArtists && relatedArtists.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6">Similar Artists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {(relatedArtists as Provider[]).map((artist) => (
                <ArtistCard key={artist.id} provider={artist} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
