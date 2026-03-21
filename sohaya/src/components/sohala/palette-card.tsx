'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Plus, ChevronDown, ChevronUp, Zap } from 'lucide-react'

interface Props {
  palette: any
  upsells?: any[]
}

export function PaletteCard({ palette, upsells = [] }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [addedUpsells, setAddedUpsells] = useState<string[]>([])
  const [booked, setBooked] = useState(false)

  const relevantUpsells = upsells.filter(u => !addedUpsells.includes(u.id))
  const totalUpsellPrice = addedUpsells.reduce((sum, id) => {
    const u = upsells.find(x => x.id === id)
    return sum + (u?.add_price || 0)
  }, 0)
  const finalPrice = palette.package_price + totalUpsellPrice

  return (
    <motion.div
      layout
      className="bg-gradient-to-br from-[#1A1A2E] to-[#141414] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors"
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{palette.icon}</span>
              <span className="text-xs bg-[#E50914]/20 text-[#E50914] px-2 py-0.5 rounded-full font-medium">
                Save ₹{palette.saving?.toLocaleString('en-IN')}
              </span>
            </div>
            <h3 className="font-bold text-white text-lg leading-tight">{palette.name}</h3>
            <p className="text-[#666] text-sm mt-1">{palette.description}</p>
          </div>
        </div>

        {/* Member artist mini-cards — assembly animation */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {palette.members?.map((member: any, i: number) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: i * 0.12, type: 'spring', damping: 20 }}
              className="flex items-center gap-2 bg-black/30 rounded-lg px-2 py-1.5"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E50914]/40 to-[#FF6B35]/20 flex items-center justify-center text-xs font-bold">
                {(member.display_name || 'A')[0]}
              </div>
              <div>
                <div className="text-xs font-medium text-white leading-none">{member.palette_role}</div>
                <div className="text-[10px] text-[#666] leading-none mt-0.5 truncate max-w-[80px]">
                  {member.display_name}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Price block */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[#666] text-xs line-through">
              ₹{palette.total_client_price?.toLocaleString('en-IN')} separately
            </div>
            <motion.div
              key={finalPrice}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-white"
            >
              ₹{finalPrice.toLocaleString('en-IN')}
            </motion.div>
            {addedUpsells.length > 0 && (
              <div className="text-xs text-[#00C853]">
                +{addedUpsells.length} add-on{addedUpsells.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
          <motion.button
            onClick={() => setBooked(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              booked
                ? 'bg-[#00C853] text-white'
                : 'bg-gradient-to-r from-[#E50914] to-[#C2000F] text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {booked ? 'In Cart!' : 'Book Package'}
          </motion.button>
        </div>
      </div>

      {/* Upsells — expand section */}
      <AnimatePresence>
        {relevantUpsells.length > 0 && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="border-t border-white/5"
          >
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between px-5 py-3 text-sm text-[#B3B3B3] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FFD700]" />
                Enhance your package ({relevantUpsells.length} add-on
                {relevantUpsells.length > 1 ? 's' : ''} available)
              </span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-5 pb-4 space-y-2"
                >
                  {relevantUpsells.map((upsell) => (
                    <motion.div
                      key={upsell.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between bg-black/20 rounded-xl p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{upsell.title}</span>
                          {upsell.badge && (
                            <span className="text-xs bg-[#FFD700]/20 text-[#FFD700] px-1.5 py-0.5 rounded-full">
                              {upsell.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#666] mt-0.5">{upsell.description}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-3">
                        <div className="text-right">
                          <div className="text-sm font-bold text-white">
                            +₹{upsell.add_price?.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setAddedUpsells(prev => [...prev, upsell.id])}
                          className="w-8 h-8 rounded-full bg-[#E50914]/20 hover:bg-[#E50914]/40 flex items-center justify-center text-[#E50914] transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
