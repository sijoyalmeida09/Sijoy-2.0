import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/sohala/navbar'
import { Footer } from '@/components/sohala/footer'
import { CategoryGrid } from '@/components/sohala/category-grid'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Zap,
  Shield,
  Star,
  ArrowRight,
  Music,
  Mic2,
  Award,
} from 'lucide-react'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch featured artists for the preview carousel
  const { data: featuredArtists } = await supabase
    .from('providers')
    .select('id, display_name, categories, city, state, avg_rating, base_rate_inr, photo_urls, is_founder, is_online')
    .eq('status', 'verified')
    .order('avg_rating', { ascending: false })
    .limit(6)

  const STATS = [
    { value: '500+', label: 'Verified Artists' },
    { value: '50+', label: 'Cities' },
    { value: '10,000+', label: 'Events Hosted' },
    { value: '4.8★', label: 'Average Rating' },
  ]

  const FEATURES = [
    {
      icon: Zap,
      label: 'Go Live Engine',
      desc: 'Uber-style instant booking — artists go live and you book them within minutes.',
      color: 'text-accent-green',
      bg: 'bg-accent-green/10 border-accent-green/20',
    },
    {
      icon: Sparkles,
      label: 'AI-Powered Matching',
      desc: 'Describe your dream event and our AI finds the perfect artists for you.',
      color: 'text-accent',
      bg: 'bg-accent/10 border-accent/20',
    },
    {
      icon: Shield,
      label: 'Verified Artists',
      desc: 'Every artist is background-verified, reviewed and quality-checked by our team.',
      color: 'text-accent-gold',
      bg: 'bg-accent-gold/10 border-accent-gold/20',
    },
  ]

  return (
    <div className="min-h-screen bg-primary">
      <Navbar user={user} />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-primary to-primary" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(229,9,20,0.08),transparent_70%)]" />

        {/* Floating music notes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {['♪', '♫', '♩', '🎵', '♬', '🎶'].map((note, i) => (
            <span
              key={i}
              className="float-note absolute text-white/10 text-4xl select-none"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.8}s`,
                fontSize: `${2 + (i % 3)}rem`,
              }}
            >
              {note}
            </span>
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
            <span className="h-2 w-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-sm text-text-secondary">
              India's Premier Entertainment Marketplace
            </span>
          </div>

          {/* Headline */}
          <h1 className="heading-hero text-white mb-6">
            Your Celebration,{' '}
            <span className="gradient-text-red">Perfectly Performed</span>
          </h1>
          <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Book verified artists for weddings, corporate events, and restaurants across India.
            AI-powered matching in seconds.
          </p>

          {/* DUAL ENTRY POINT */}
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-16">
            {/* AI Concierge Card */}
            <div className="bg-card border border-accent/20 rounded-2xl p-6 text-left hover:border-accent/40 transition-all duration-300 group">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-accent" />
                </div>
                <span className="font-semibold text-white">✨ Tell us your dream celebration</span>
              </div>
              <textarea
                className="w-full bg-transparent text-text-secondary placeholder-text-muted text-sm resize-none focus:outline-none leading-relaxed mb-4"
                rows={3}
                placeholder="I'm planning a wedding sangeet for 200 guests in Mumbai with a budget of ₹1.5 lakh..."
                readOnly
              />
              <Link href="/discover">
                <Button variant="primary" size="md" className="w-full">
                  <Sparkles className="h-4 w-4" />
                  Find Artists with AI
                </Button>
              </Link>
            </div>

            {/* Browse Card */}
            <div className="bg-card border border-white/8 rounded-2xl p-6 text-left">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Music className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-white">Browse by Category</span>
              </div>
              <CategoryGrid compact />
              <Link href="/discover" className="block mt-4">
                <Button variant="outline" size="md" className="w-full">
                  Browse All Artists
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold gradient-text-red">{value}</div>
                <div className="text-xs text-text-muted mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="heading-section text-white mb-4">Why Sohala?</h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            We've reimagined how India books entertainment — faster, smarter, more joyful.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, label, desc, color, bg }) => (
            <div
              key={label}
              className={`border rounded-2xl p-6 ${bg} transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className={`h-10 w-10 rounded-xl ${bg} border flex items-center justify-center mb-4`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="font-bold text-white mb-2">{label}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Netflix-style Carousel Preview */}
      {featuredArtists && featuredArtists.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-accent-gold" />
              Top Artists on Sohala
            </h2>
            <Link href="/discover" className="text-sm text-accent hover:underline flex items-center gap-1">
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
            {featuredArtists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artists/${artist.id}`}
                className="flex-shrink-0 w-60 bg-card border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300 group hover:scale-[1.02]"
              >
                <div className="aspect-video bg-card-hover relative overflow-hidden">
                  {artist.photo_urls?.[0] ? (
                    <img
                      src={artist.photo_urls[0]}
                      alt={artist.display_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="h-8 w-8 text-text-muted" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {artist.is_online && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-accent-green/20 border border-accent-green/40 rounded-full px-2 py-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-green animate-pulse" />
                      <span className="text-accent-green text-xs font-semibold">LIVE</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-semibold text-white text-sm truncate">{artist.display_name}</div>
                  <div className="text-xs text-text-muted capitalize mt-0.5">
                    {artist.categories?.[0]?.replace(/-/g, ' ')} · {artist.city}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-accent-gold fill-accent-gold" />
                      <span className="text-xs font-bold text-accent-gold">{artist.avg_rating?.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-white font-semibold">
                      ₹{artist.base_rate_inr?.toLocaleString('en-IN')}+
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How it Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="heading-section text-white mb-4">How Sohala Works</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '01', icon: Sparkles, title: 'Describe Your Event', desc: 'Tell our AI about your celebration — venue, vibe, budget' },
            { step: '02', icon: Music, title: 'Get Matched', desc: 'AI finds perfect artists within seconds' },
            { step: '03', icon: Mic2, title: 'Review & Book', desc: 'Compare quotes, check reviews, confirm' },
            { step: '04', icon: Award, title: 'Celebrate!', desc: 'Sit back while Sohala handles the rest' },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="text-center">
              <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-full bg-card border border-white/10 mb-4 mx-auto">
                <Icon className="h-6 w-6 text-accent" />
                <span className="absolute -top-2 -right-2 h-5 w-5 bg-accent rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {step}
                </span>
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-text-muted text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-br from-red-950/50 to-card border border-accent/20 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to make your celebration unforgettable?
          </h2>
          <p className="text-text-secondary mb-8">
            Join 10,000+ happy clients who booked extraordinary artists through Sohala.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/discover">
              <Button variant="primary" size="lg">
                <Sparkles className="h-5 w-5" />
                Find Artists Now
              </Button>
            </Link>
            <Link href="/provider/join">
              <Button variant="outline" size="lg">
                Join as Artist
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
