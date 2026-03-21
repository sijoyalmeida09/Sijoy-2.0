'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const CATEGORIES = [
  {
    id: 'musical-act',
    slug: 'musical-act',
    label: 'Musical Act',
    icon: '🎵',
    description: 'Bands, singers, DJs, classical',
    color: 'from-[#E50914]/20 to-[#C2000F]/5',
    borderColor: 'border-red-500/20 hover:border-red-500/50',
    subcategories: ['Bollywood Band', 'DJ', 'Ghazal', 'Classical', 'Folk', 'Wedding Specialist'],
  },
  {
    id: 'entertainer',
    slug: 'entertainer',
    label: 'Entertainer',
    icon: '🎭',
    description: 'Dancers, comedians, performers',
    color: 'from-[#7C3AED]/20 to-[#5B21B6]/5',
    borderColor: 'border-purple-500/20 hover:border-purple-500/50',
    subcategories: ['Dancer', 'Comedian', 'Dhol Player', 'Fire Performer', "Children's Act"],
  },
  {
    id: 'speaker',
    slug: 'speakers',
    label: 'Speakers',
    icon: '🎤',
    description: 'Emcees, anchors, corporate',
    color: 'from-[#2563EB]/20 to-[#1D4ED8]/5',
    borderColor: 'border-blue-500/20 hover:border-blue-500/50',
    subcategories: ['Corporate Speaker', 'Motivational', 'Emcee', 'Wedding Host', 'Stand-Up'],
  },
  {
    id: 'event-service',
    slug: 'event-services',
    label: 'Event Services',
    icon: '🎪',
    description: 'Sound, decor, photography',
    color: 'from-[#D97706]/20 to-[#B45309]/5',
    borderColor: 'border-amber-500/20 hover:border-amber-500/50',
    subcategories: ['Sound & Light', 'Decor', 'Photographer', 'Catering', 'Photo Booth'],
  },
]

interface CategoryGridProps {
  onSelect?: (category: string) => void
  compact?: boolean
}

export function CategoryGrid({ onSelect, compact = false }: CategoryGridProps) {
  const router = useRouter()

  const handleSelect = (cat: typeof CATEGORIES[number]) => {
    if (onSelect) {
      onSelect(cat.label)
    } else {
      router.push(`/discover?category=${cat.slug}`)
    }
  }

  return (
    <div className={`grid grid-cols-2 ${compact ? 'gap-2' : 'gap-4 md:grid-cols-4'}`}>
      {CATEGORIES.map((cat, i) => (
        <motion.button
          key={cat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSelect(cat)}
          className={`bg-gradient-to-br ${cat.color} border ${cat.borderColor} rounded-2xl p-6 text-left transition-colors group`}
        >
          <span className="text-3xl block mb-3">{cat.icon}</span>
          <h3 className="font-bold text-white text-base mb-1">{cat.label}</h3>
          {!compact && (
            <p className="text-[#666] text-xs group-hover:text-[#B3B3B3] transition-colors">
              {cat.description}
            </p>
          )}
        </motion.button>
      ))}
    </div>
  )
}

export { CATEGORIES }
