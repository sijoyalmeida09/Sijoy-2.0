'use client'

import { useState } from 'react'
import { Provider } from '@/types'
import { AIPrompt } from '@/components/sohala/ai-prompt'
import { CategoryGrid } from '@/components/sohala/category-grid'
import { ArtistCard } from '@/components/sohala/artist-card'
import { Carousel } from '@/components/sohala/carousel'
import { ArtistCardSkeleton } from '@/components/ui/loading'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Sparkles } from 'lucide-react'

interface DiscoverClientProps {
  initialArtists: Provider[]
  trending: Provider[]
  liveTonight: Provider[]
  weddingPicks: Provider[]
  founders: Provider[]
  budgetFriendly: Provider[]
  newest: Provider[]
  initialCategory?: string
  initialCity?: string
}

export function DiscoverClient({
  initialArtists,
  trending,
  liveTonight,
  weddingPicks,
  founders,
  budgetFriendly,
  newest,
  initialCategory,
}: DiscoverClientProps) {
  const [aiResultsVisible, setAiResultsVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory ?? null)

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug === selectedCategory ? null : slug)
    setAiResultsVisible(false)
  }

  const filteredArtists = selectedCategory
    ? initialArtists.filter((a) => a.categories?.includes(selectedCategory))
    : initialArtists

  const carousels = [
    { key: 'trending', title: 'Trending in India', icon: '🔥', artists: trending },
    { key: 'live', title: 'Available Tonight', icon: '🟢', artists: liveTonight },
    { key: 'wedding', title: 'Perfect for Weddings', icon: '💍', artists: weddingPicks },
    { key: 'founders', title: 'Sohaya Founders', icon: '⭐', artists: founders },
    { key: 'budget', title: 'Budget-Friendly (Under ₹5,000)', icon: '💰', artists: budgetFriendly },
    { key: 'new', title: 'New on Sohaya', icon: '🆕', artists: newest },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Discover Artists</h1>
        <p className="text-text-secondary">Find the perfect entertainment for your celebration</p>
      </div>

      {/* DUAL ENTRY POINT */}
      <div className="mb-10 space-y-4">
        {/* AI Prompt */}
        <div className="bg-gradient-to-br from-card to-card-hover border border-accent/20 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-7 w-7 rounded-lg bg-accent/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <h2 className="font-bold text-white">✨ Describe your celebration</h2>
          </div>
          <AIPrompt
            onResults={() => setAiResultsVisible(true)}
          />
        </div>

        {/* OR Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-text-muted text-sm font-medium">OR browse by category</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Category Tiles */}
        <CategoryGrid onSelect={handleCategorySelect} />
      </div>

      {/* Category Filter Active */}
      <AnimatePresence>
        {selectedCategory && !aiResultsVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white capitalize">
                {selectedCategory.replace(/-/g, ' ')} Artists
              </h2>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-text-muted hover:text-white transition-colors"
              >
                Clear filter
              </button>
            </div>
            {filteredArtists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredArtists.map((artist) => (
                  <ArtistCard key={artist.id} provider={artist} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map((i) => <ArtistCardSkeleton key={i} />)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Netflix Carousels — shown when no category/AI filter active */}
      {!selectedCategory && !aiResultsVisible && (
        <div className="space-y-12">
          {carousels.map(({ key, title, icon, artists }) => {
            if (!artists || artists.length === 0) return null
            return (
              <Carousel key={key} title={title} icon={icon}>
                {artists.map((artist) => (
                  <div key={artist.id} className="flex-shrink-0 w-64">
                    <ArtistCard provider={artist} />
                  </div>
                ))}
              </Carousel>
            )
          })}

          {/* Founder Feature */}
          {founders.length > 0 && (
            <div className="bg-gradient-to-r from-purple-950/50 to-indigo-950/50 border border-purple-500/20 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-purple-300" />
                <h2 className="font-bold text-white">Sohaya Founder Artists</h2>
                <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  Zero Commission
                </span>
              </div>
              <p className="text-text-secondary text-sm mb-4">
                Our founding artists joined early and bring unmatched experience to every event.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {founders.map((artist) => (
                  <ArtistCard key={artist.id} provider={artist} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
