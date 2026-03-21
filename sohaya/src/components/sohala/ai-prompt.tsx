'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Provider, SearchResult } from '@/types'
import { ArtistCard } from './artist-card'
import { ThinkingDots } from '@/components/ui/loading'
import { motion, AnimatePresence } from 'framer-motion'

const PLACEHOLDER_EXAMPLES = [
  'I need a Bollywood band for my daughter\'s wedding sangeet in Mumbai, budget ₹2 lakh...',
  'Looking for a ghazal singer for our 25th anniversary dinner in Pune...',
  'Corporate awards night in Bangalore — need an emcee and a jazz band...',
  'Sufi singer for a mehendi ceremony in Jaipur, 150 guests, budget ₹50,000...',
  'Classical Bharatnatyam dancer for a cultural event in Chennai...',
  'DJ for a birthday bash in Delhi NCR, crowd is 25-35 age group...',
]

interface AIPromptProps {
  onResults?: (results: SearchResult) => void
  className?: string
}

export function AIPrompt({ onResults, className }: AIPromptProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [results, setResults] = useState<SearchResult | null>(null)
  const [error, setError] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Animated placeholder cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_EXAMPLES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const target = PLACEHOLDER_EXAMPLES[placeholderIndex]
    let i = 0
    setDisplayedPlaceholder('')
    const typeInterval = setInterval(() => {
      if (i <= target.length) {
        setDisplayedPlaceholder(target.slice(0, i))
        i++
      } else {
        clearInterval(typeInterval)
      }
    }, 30)
    return () => clearInterval(typeInterval)
  }, [placeholderIndex])

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setThinking(true)
    setError('')
    setResults(null)

    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      if (!res.ok) throw new Error('Search failed')

      const data: SearchResult = await res.json()
      setThinking(false)
      setResults(data)
      onResults?.(data)
    } catch {
      setError('Something went wrong. Please try again.')
      setThinking(false)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSearch()
    }
  }

  return (
    <div className={className}>
      {/* Prompt Box */}
      <div className="relative bg-card-hover border border-white/10 rounded-2xl overflow-hidden focus-within:border-accent/50 transition-all duration-300 shadow-2xl">
        <div className="flex items-start gap-3 p-4">
          <Sparkles className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={displayedPlaceholder || PLACEHOLDER_EXAMPLES[0]}
            rows={3}
            className="flex-1 bg-transparent text-white placeholder-text-muted text-base resize-none focus:outline-none leading-relaxed"
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
          <span className="text-xs text-text-muted">⌘ + Enter to search</span>
          <Button
            variant="primary"
            size="md"
            onClick={handleSearch}
            loading={loading}
            disabled={!query.trim()}
            className="gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Find Artists
          </Button>
        </div>
      </div>

      {/* AI Thinking State */}
      <AnimatePresence>
        {thinking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 flex items-center gap-3 text-text-secondary"
          >
            <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <span className="text-sm">Sohaya is finding perfect artists for you</span>
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
        {results && !thinking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 space-y-4"
          >
            {/* AI Narrative */}
            <div className="flex items-start gap-3 p-4 bg-accent/5 border border-accent/20 rounded-2xl">
              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">
                  {results.interpretation.narrative}
                </p>
                {results.interpretation.city && (
                  <p className="text-text-muted text-xs mt-1">
                    Found {results.artists.length} artists in {results.interpretation.city}
                    {results.interpretation.event_type && ` for ${results.interpretation.event_type}`}
                  </p>
                )}
              </div>
            </div>

            {/* Palette Suggestion */}
            {results.palette_suggestion && (
              <div className="p-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💡</span>
                  <span className="font-semibold text-white text-sm">
                    {results.palette_suggestion.title}
                  </span>
                  <span className="text-xs bg-accent-gold/20 text-accent-gold px-2 py-0.5 rounded-full">
                    Save {results.palette_suggestion.savings_percentage}%
                  </span>
                </div>
                <p className="text-text-secondary text-xs">{results.palette_suggestion.description}</p>
                <div className="flex gap-2 mt-3">
                  {results.palette_suggestion.provider_types.map((type) => (
                    <span key={type} className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-text-secondary">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Artist Grid */}
            {results.artists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.artists.map((artist, i) => (
                  <motion.div
                    key={artist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <ArtistCard provider={artist} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-text-muted">
                <p className="text-lg">No artists found for your search.</p>
                <p className="text-sm mt-2">Try different keywords or browse categories below.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
