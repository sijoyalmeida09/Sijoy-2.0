'use client'
import { motion } from 'framer-motion'

interface Props {
  budget: number
  artistsWithinBudget: number
  totalArtists: number
}

export function BudgetRing({ budget, artistsWithinBudget, totalArtists }: Props) {
  const pct = totalArtists > 0 ? artistsWithinBudget / totalArtists : 0
  const circumference = 2 * Math.PI * 20
  const dashOffset = circumference * (1 - pct)
  const color = pct > 0.6 ? '#00C853' : pct > 0.3 ? '#FFD700' : '#E50914'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5"
    >
      <svg width="36" height="36" className="-rotate-90">
        <circle cx="18" cy="18" r="20" fill="none" stroke="#222" strokeWidth="3" />
        <motion.circle
          cx="18"
          cy="18"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.8, type: 'spring' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="text-xs">
        <div className="font-semibold text-white">{artistsWithinBudget} in budget</div>
        <div className="text-[#666]">₹{(budget / 1000).toFixed(0)}k limit</div>
      </div>
    </motion.div>
  )
}
