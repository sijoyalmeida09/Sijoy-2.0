import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Sparkles, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Palette } from '@/types'
import { formatCurrency } from '@/lib/utils'

export default async function PalettesPage() {
  const supabase = createClient()

  const { data: palettes } = await supabase
    .from('palettes')
    .select('*, providers:provider_ids')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const EVENT_PALETTES = [
    {
      name: 'Ultimate Sangeet Package',
      event_type: 'Sangeet',
      emoji: '💃',
      providers: ['DJ', 'Dhol Player', 'Emcee'],
      desc: 'The complete Sangeet experience — high-energy DJ set, live dhol beats, and a charismatic emcee to keep the crowd going.',
      price_from: 85000,
      savings: 15,
    },
    {
      name: 'Romantic Wedding Mood',
      event_type: 'Wedding Reception',
      emoji: '💍',
      providers: ['Ghazal Singer', 'String Quartet', 'Jazz Trio'],
      desc: 'Set the perfect romantic ambiance with soulful ghazals, elegant strings, and jazz melodies for your wedding reception.',
      price_from: 120000,
      savings: 20,
    },
    {
      name: 'Corporate Powerhouse',
      event_type: 'Corporate Event',
      emoji: '🏆',
      providers: ['Keynote Speaker', 'Emcee', 'Live Band'],
      desc: 'Inspire, engage, and entertain your corporate audience with a curated mix of world-class speakers and live music.',
      price_from: 150000,
      savings: 12,
    },
    {
      name: 'Birthday Blast',
      event_type: 'Birthday Party',
      emoji: '🎂',
      providers: ['DJ', 'Magician', 'Comedian'],
      desc: 'Make the birthday unforgettable with a pumping DJ, mind-bending magic show, and hilarious stand-up comedy.',
      price_from: 50000,
      savings: 18,
    },
    {
      name: 'Classical Mehndi',
      event_type: 'Mehndi Ceremony',
      emoji: '🌸',
      providers: ['Folk Singer', 'Dhol Player', 'Kalash Dancer'],
      desc: 'Beautiful traditional entertainment for your mehndi — folk music, live dhol, and graceful traditional dance.',
      price_from: 45000,
      savings: 10,
    },
    {
      name: 'Restaurant Entertainment',
      event_type: 'Restaurant',
      emoji: '🍽️',
      providers: ['Acoustic Guitarist', 'Saxophonist', 'Jazz Vocalist'],
      desc: 'Elevate your restaurant ambiance with smooth live music — perfect background entertainment for fine dining.',
      price_from: 15000,
      savings: 8,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-4">
          <Sparkles className="h-4 w-4 text-purple-300" />
          <span className="text-sm text-purple-300">AI-Assembled Packages</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Celebration Palettes</h1>
        <p className="text-text-secondary max-w-xl mx-auto leading-relaxed">
          Our AI has assembled the perfect artist combinations for every type of event.
          Book a complete package and save up to 20% compared to individual bookings.
        </p>
      </div>

      {/* Featured Palettes */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {EVENT_PALETTES.map((palette) => (
          <div
            key={palette.name}
            className="bg-gradient-to-br from-card to-card-hover border border-white/8 rounded-3xl p-6 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.01] group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-3xl">{palette.emoji}</span>
                <div className="text-xs text-text-muted mt-1 capitalize">{palette.event_type}</div>
              </div>
              <span className="bg-accent-gold/20 text-accent-gold text-xs font-bold px-2 py-1 rounded-full">
                Save {palette.savings}%
              </span>
            </div>

            <h3 className="font-bold text-white text-lg mb-2 group-hover:text-purple-300 transition-colors">
              {palette.name}
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">{palette.desc}</p>

            {/* Provider Types */}
            <div className="flex flex-wrap gap-2 mb-5">
              {palette.providers.map((type) => (
                <span
                  key={type}
                  className="flex items-center gap-1 text-xs bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full"
                >
                  <Package className="h-2.5 w-2.5" />
                  {type}
                </span>
              ))}
            </div>

            {/* Price */}
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-text-muted">Starting from</div>
                <div className="text-xl font-bold text-white">{formatCurrency(palette.price_from)}</div>
              </div>
              <Link href={`/discover?palette=${encodeURIComponent(palette.name)}`}>
                <Button variant="primary" size="sm">
                  Book Package
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Palette CTA */}
      <div className="mt-16 bg-gradient-to-r from-purple-950/50 to-indigo-950/50 border border-purple-500/20 rounded-3xl p-8 text-center">
        <Sparkles className="h-10 w-10 text-purple-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-3">Need a Custom Package?</h2>
        <p className="text-text-secondary mb-6 max-w-md mx-auto">
          Tell our AI about your event and we'll assemble the perfect artist palette tailored to your vision, budget, and city.
        </p>
        <Link href="/discover">
          <Button variant="primary" size="lg">
            <Sparkles className="h-5 w-5" />
            Build My Custom Palette
          </Button>
        </Link>
      </div>
    </div>
  )
}
