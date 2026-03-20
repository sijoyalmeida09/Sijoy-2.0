'use client'

import { useReducer, useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Search, Sparkles, Zap, Users, X } from 'lucide-react'
import { ArtistCard } from '@/components/sohala/artist-card'
import { PaletteCard } from '@/components/sohala/palette-card'
import { CategoryGrid } from '@/components/sohala/category-grid'
import { BudgetRing } from '@/components/sohala/budget-ring'
import { StreamStatusBar } from '@/components/sohala/stream-status-bar'
import type { Provider } from '@/types'

// --- State Machine ---
type Phase = 'idle' | 'parsing' | 'matching' | 'assembling' | 'narrating' | 'done' | 'error'

interface StreamEvent {
  type: string
  message?: string
  data?: any
  batch?: number
  total?: number
  summary?: string
  stats?: { artists_found: number; palettes_built: number; live_now: number; within_budget: number }
}

interface CanvasState {
  phase: Phase
  query: string
  statusMessage: string
  intent: any | null
  artists: Provider[]
  palettes: any[]
  upsells: any[]
  summary: string
  stats: any | null
  newArtistIds: Set<string>
}

type Action =
  | { type: 'SEARCH_START'; query: string }
  | { type: 'EVENT'; event: StreamEvent }
  | { type: 'RESET' }

function reducer(state: CanvasState, action: Action): CanvasState {
  switch (action.type) {
    case 'SEARCH_START':
      return {
        ...state,
        phase: 'parsing',
        query: action.query,
        artists: [],
        palettes: [],
        upsells: [],
        summary: '',
        stats: null,
        newArtistIds: new Set(),
        statusMessage: 'Reading your request...',
      }

    case 'EVENT': {
      const e = action.event
      switch (e.type) {
        case 'parsing':
          return { ...state, phase: 'parsing', statusMessage: e.message || 'Parsing...' }
        case 'intent':
          return {
            ...state,
            intent: e.data,
            statusMessage: `Planning your ${e.data?.event_type || 'event'} in ${e.data?.city || 'India'}`,
          }
        case 'matching':
          return { ...state, phase: 'matching', statusMessage: e.message || 'Matching artists...' }
        case 'artists_batch': {
          const incoming = (e.data || []) as Provider[]
          const existingIds = new Set(state.artists.map((a: any) => a.id))
          const brandNew = incoming.filter((a: any) => !existingIds.has(a.id))
          const merged = [...state.artists, ...brandNew].sort(
            (a: any, b: any) => (b.match_score || 0) - (a.match_score || 0)
          )
          return {
            ...state,
            artists: merged,
            newArtistIds: new Set(brandNew.map((a: any) => a.id)),
            statusMessage:
              e.batch === 1
                ? `Found ${e.total} artists — showing best matches first`
                : `Loading ${merged.length} of ${e.total} artists...`,
          }
        }
        case 'assembling':
          return { ...state, phase: 'assembling', statusMessage: e.message || 'Building packages...' }
        case 'palette':
          return { ...state, palettes: [...state.palettes, e.data] }
        case 'upsells':
          return { ...state, upsells: e.data || [] }
        case 'narrating':
          return { ...state, phase: 'narrating', statusMessage: e.message || 'Almost ready...' }
        case 'done':
          return {
            ...state,
            phase: 'done',
            summary: e.summary || '',
            stats: e.stats || null,
            statusMessage: '',
          }
        case 'error':
          return { ...state, phase: 'error', statusMessage: e.message || 'Error occurred' }
        default:
          return state
      }
    }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

const initialState: CanvasState = {
  phase: 'idle',
  query: '',
  statusMessage: '',
  intent: null,
  artists: [],
  palettes: [],
  upsells: [],
  summary: '',
  stats: null,
  newArtistIds: new Set(),
}

// --- Component ---
export function LivingCanvas() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [inputValue, setInputValue] = useState('')
  const [budget, setBudget] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const isSearching = state.phase !== 'idle' && state.phase !== 'done' && state.phase !== 'error'

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim() || isSearching) return

      abortRef.current?.abort()
      abortRef.current = new AbortController()

      dispatch({ type: 'SEARCH_START', query })

      try {
        const res = await fetch('/api/ai/orchestrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            budget: budget ? parseInt(budget) : null,
            city: null,
          }),
          signal: abortRef.current.signal,
        })

        if (!res.ok || !res.body) throw new Error('Stream failed')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const event: StreamEvent = JSON.parse(line.slice(6))
                dispatch({ type: 'EVENT', event })
              } catch {}
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          dispatch({ type: 'EVENT', event: { type: 'error', message: 'Connection lost. Try again.' } })
        }
      }
    },
    [isSearching, budget]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch(inputValue)
    }
  }

  const isActive = state.phase !== 'idle'
  const hasResults = state.artists.length > 0 || state.palettes.length > 0

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">

      {/* === SEARCH SECTION — shrinks when results arrive === */}
      <motion.div
        layout
        className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/5"
        animate={{
          paddingTop: hasResults ? '1rem' : '4rem',
          paddingBottom: hasResults ? '1rem' : '3rem',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className="max-w-4xl mx-auto px-4">

          {/* Title — fades out when searching */}
          <AnimatePresence>
            {!isActive && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="text-center mb-6"
              >
                <motion.div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-[#E50914]" />
                  <span className="text-sm text-[#B3B3B3] font-medium tracking-widest uppercase">
                    Sohala AI Concierge
                  </span>
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Describe your{' '}
                  <span className="bg-gradient-to-r from-[#E50914] to-[#FF6B35] bg-clip-text text-transparent">
                    celebration
                  </span>
                </h1>
                <p className="text-[#666] mt-2 text-sm">
                  The page will transform around your needs in real time
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Input */}
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
              <input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Sangeet for 150 guests in Mumbai, budget ₹80,000..."
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-[#444] focus:outline-none focus:border-[#E50914]/50 focus:ring-1 focus:ring-[#E50914]/20 text-base transition-all"
                disabled={isSearching}
              />
              {isSearching && (
                <motion.div
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#E50914] border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </div>

            {/* Budget input */}
            <input
              value={budget}
              onChange={e => setBudget(e.target.value.replace(/\D/g, ''))}
              placeholder="Budget ₹"
              className="w-28 bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-4 text-white placeholder:text-[#444] focus:outline-none focus:border-[#E50914]/50 text-sm"
              disabled={isSearching}
            />

            <motion.button
              onClick={() => handleSearch(inputValue)}
              disabled={isSearching || !inputValue.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gradient-to-r from-[#E50914] to-[#C2000F] text-white px-6 py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              <Zap className="w-4 h-4" />
              {isSearching ? 'Working...' : 'Find Artists'}
            </motion.button>

            {isActive && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => {
                  abortRef.current?.abort()
                  dispatch({ type: 'RESET' })
                  setInputValue('')
                }}
                className="w-12 h-14 flex items-center justify-center bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-[#B3B3B3]" />
              </motion.button>
            )}
          </div>

          {/* Status bar + stats */}
          <AnimatePresence>
            {isActive && (
              <StreamStatusBar
                phase={state.phase}
                message={state.statusMessage}
                stats={state.stats}
                artistCount={state.artists.length}
                paletteCount={state.palettes.length}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* === IDLE STATE: Category Grid === */}
      <AnimatePresence>
        {!isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto px-4 py-12"
          >
            <p className="text-center text-[#666] mb-8 text-sm">— or browse by category —</p>
            <CategoryGrid
              onSelect={(cat) => {
                setInputValue(`Show me ${cat} artists`)
                handleSearch(`Show me ${cat} artists`)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* === ACTIVE STATE: Living Canvas === */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto px-4 py-6"
          >
            <LayoutGroup id="canvas">

              {/* Intent + Budget Ring row */}
              <AnimatePresence>
                {state.intent && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap items-center gap-3 mb-6"
                  >
                    <IntentTags intent={state.intent} />
                    {(state.intent.budget_inr || budget) && (
                      <BudgetRing
                        budget={parseInt(budget) || state.intent.budget_inr}
                        artistsWithinBudget={state.stats?.within_budget || 0}
                        totalArtists={state.artists.length}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Narrative Summary */}
              <AnimatePresence>
                {state.summary && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-[#E50914]/10 to-[#FF6B35]/5 border border-[#E50914]/20 rounded-xl p-4 mb-6 flex items-start gap-3"
                  >
                    <Sparkles className="w-5 h-5 text-[#E50914] mt-0.5 flex-shrink-0" />
                    <p className="text-[#E8E8E8] leading-relaxed">{state.summary}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* === PALETTES SECTION === */}
              <AnimatePresence>
                {state.palettes.length > 0 && (
                  <motion.section
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">🎁</span>
                      <h2 className="text-xl font-bold">Curated Packages</h2>
                      <span className="text-xs bg-[#E50914]/20 text-[#E50914] px-2 py-0.5 rounded-full font-medium">
                        Save up to 5%
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AnimatePresence>
                        {state.palettes.map((palette: any, i: number) => (
                          <motion.div
                            key={palette.id}
                            layout
                            layoutId={palette.id}
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{
                              type: 'spring',
                              damping: 20,
                              stiffness: 200,
                              delay: i * 0.1,
                            }}
                          >
                            <PaletteCard palette={palette} upsells={state.upsells} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* === ASSEMBLING SKELETON (while palettes are building) === */}
              <AnimatePresence>
                {state.phase === 'assembling' && state.palettes.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10"
                  >
                    {[0, 1].map(i => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                        className="h-48 bg-[#1A1A1A] rounded-2xl border border-white/5"
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* === ARTISTS GRID === */}
              <AnimatePresence>
                {state.artists.length > 0 && (
                  <motion.section layout>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#B3B3B3]" />
                        <h2 className="text-xl font-bold">
                          {state.stats
                            ? `${state.stats.artists_found} Artists`
                            : `${state.artists.length} Artists`}
                        </h2>
                        {state.artists.filter((a: any) => a.is_online).length > 0 && (
                          <span className="flex items-center gap-1 text-xs bg-[#00C853]/20 text-[#00C853] px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
                            {state.artists.filter((a: any) => a.is_online).length} Live Now
                          </span>
                        )}
                      </div>
                      {state.stats && budget && (
                        <span className="text-sm text-[#B3B3B3]">
                          {state.stats.within_budget} within your budget
                        </span>
                      )}
                    </div>

                    <motion.div
                      layout
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
                    >
                      <AnimatePresence mode="popLayout">
                        {state.artists.map((artist: any, i: number) => {
                          const isNew = state.newArtistIds.has(artist.id)
                          const isOverBudget =
                            budget && artist.client_display_price > parseInt(budget)

                          return (
                            <motion.div
                              key={artist.id}
                              layout
                              layoutId={artist.id}
                              initial={isNew ? { opacity: 0, scale: 0.8, y: 30 } : false}
                              animate={{
                                opacity: isOverBudget ? 0.4 : 1,
                                scale: 1,
                                y: 0,
                                filter: isOverBudget ? 'grayscale(60%)' : 'grayscale(0%)',
                              }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{
                                layout: { type: 'spring', damping: 25, stiffness: 300 },
                                opacity: { duration: 0.3 },
                                delay: isNew ? (i % 6) * 0.05 : 0,
                              }}
                              whileHover={{ scale: 1.03, zIndex: 10 }}
                              className="relative"
                            >
                              {artist.is_online && (
                                <motion.div
                                  className="absolute -top-1 -right-1 z-10 w-3 h-3 rounded-full bg-[#00C853]"
                                  animate={{ scale: [1, 1.4, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              )}
                              {isOverBudget && (
                                <div className="absolute top-2 left-2 z-10 text-xs bg-black/80 text-[#B3B3B3] px-2 py-0.5 rounded">
                                  Over budget
                                </div>
                              )}
                              <ArtistCard artist={artist} compact />
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
                    </motion.div>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* === LOADING SKELETON for first batch === */}
              <AnimatePresence>
                {state.phase === 'matching' && state.artists.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
                  >
                    {Array.from({ length: 10 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1 }}
                        className="aspect-[3/4] bg-[#1A1A1A] rounded-xl"
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

            </LayoutGroup>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function IntentTags({ intent }: { intent: any }) {
  const tags = [
    intent.event_type && { label: intent.event_type.replace(/_/g, ' '), icon: '🎉' },
    intent.city && { label: intent.city, icon: '📍' },
    intent.mood && { label: intent.mood, icon: '✨' },
    intent.budget_inr && { label: `₹${intent.budget_inr.toLocaleString('en-IN')}`, icon: '💰' },
  ].filter(Boolean) as { label: string; icon: string }[]

  return (
    <>
      {tags.map((tag, i) => (
        <motion.span
          key={tag.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-sm text-[#E8E8E8] capitalize"
        >
          <span>{tag.icon}</span>
          {tag.label}
        </motion.span>
      ))}
    </>
  )
}
