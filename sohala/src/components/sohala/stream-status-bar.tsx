'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface Props {
  phase: string
  message: string
  stats: any | null
  artistCount: number
  paletteCount: number
}

const phaseConfig: Record<string, { color: string; bg: string }> = {
  parsing:    { color: '#FFD700', bg: 'rgba(255,215,0,0.08)' },
  matching:   { color: '#60A5FA', bg: 'rgba(96,165,250,0.08)' },
  assembling: { color: '#A78BFA', bg: 'rgba(167,139,250,0.08)' },
  narrating:  { color: '#34D399', bg: 'rgba(52,211,153,0.08)' },
  done:       { color: '#00C853', bg: 'rgba(0,200,83,0.08)' },
  error:      { color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
}

export function StreamStatusBar({ phase, message, stats, artistCount, paletteCount }: Props) {
  const cfg = phaseConfig[phase] || phaseConfig.parsing
  const isDone = phase === 'done'
  const isError = phase === 'error'

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: 'auto', marginTop: '0.75rem' }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      style={{ backgroundColor: cfg.bg, borderColor: cfg.color + '30' }}
      className="rounded-xl border px-4 py-2.5 flex items-center justify-between gap-4 overflow-hidden"
    >
      <div className="flex items-center gap-3">
        {isDone ? (
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
        ) : isError ? (
          <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
        ) : (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          <motion.span
            key={message}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm font-medium"
            style={{ color: cfg.color }}
          >
            {message}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Live counters */}
      <div className="flex items-center gap-3 text-xs text-[#666]">
        <AnimatePresence>
          {artistCount > 0 && (
            <motion.span
              key={artistCount}
              initial={{ opacity: 0, scale: 1.3 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[#B3B3B3]"
            >
              {artistCount} artists
            </motion.span>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {paletteCount > 0 && (
            <motion.span
              key={paletteCount}
              initial={{ opacity: 0, scale: 1.3 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[#B3B3B3]"
            >
              {paletteCount} packages
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
