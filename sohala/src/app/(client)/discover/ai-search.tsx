'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchResult } from '@/types'
import { ArtistCard } from '@/components/sohala/artist-card'
import { ThinkingDots } from '@/components/ui/loading'
import { motion, AnimatePresence } from 'framer-motion'

const ROTATING_HINTS = [
  'Bollywood band for wedding reception in Mumbai...',
  'Ghazal singer for anniversary dinner in Pune...',
  'Corporate emcee for awards night in Bangalore...',
  'Kathak dancer for cultural program in Delhi...',
  'DJ for birthday bash in Hyderabad...',
  'Sufi singer for mehendi ceremony in Jaipur...',
]

const REGIONS = [
  { label: 'Maharashtra', hint: 'Lavani, Powada, Marathi folk' },
  { label: 'Punjab', hint: 'Bhangra, Giddha, Punjabi folk' },
  { label: 'Tamil Nadu', hint: 'Bharatnatyam, Carnatic, Kolattam' },
  { label: 'Rajasthan', hint: 'Kalbeliya, Manganiyar, Ghazal' },
  { label: 'West Bengal', hint: 'Baul, Rabindra Sangeet, Dhak' },
  { label: 'Kerala', hint: 'Mohiniyattam, Kathakali, Thiruvathira' },
]

export function AISearch() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult | null>(null)
  const [error, setError] = useState('')
  const [hintIndex, setHintIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setHintIndex((i) => (i + 1) % ROTATING_HINTS.length), 3500)
    return () => clearInterval(id)
  }, [])

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResults(null)

    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      if (!res.ok) throw new Error()
      setResults(await res.json())
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Big Prompt Box */}
      <div className="bg-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl focus-within:border-accent/40 transition-all">
        <div className="flex gap-3 p-5">
          <Sparkles className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && e.metaKey && search()}
            placeholder={ROTATING_HINTS[hintIndex]}
            rows={3}
            className="flex-1 bg-transparent text-white placeholder-text-muted text-base focus:outline-none resize-none leading-relaxed"
          />
        </div>
        <div className="border-t border-white/5 px-5 py-3 flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {REGIONS.slice(0, 3).map((r) => (
              <button
                key={r.label}
                onClick={() => setQuery(`I need artists from ${r.label} — ${r.hint}`)}
                className="text-xs text-text-muted hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors"
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={search}
            loading={loading}
            disabled={!query.trim()}
            className="gap-2 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
            Find Artists
          </Button>
        </div>
      </div>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 flex items-center gap-3 text-text-secondary text-sm"
          >
            <Sparkles className="h-4 w-4 text-accent" />
            <span>Finding perfect matches...</span>
            <ThinkingDots />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {results && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4"
          >
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl text-sm text-white">
              <Sparkles className="h-4 w-4 text-accent inline mr-2" />
              {results.interpretation.narrative}
            </div>
            {results.artists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.artists.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <ArtistCard provider={a} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-center py-8">
                No artists found. Try different keywords.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
