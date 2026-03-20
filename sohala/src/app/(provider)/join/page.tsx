'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, ChevronLeft, Sparkles, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

type EntityType = 'individual' | 'band' | 'agency'

const STEPS = [
  'Basic Info',
  'Categories',
  'Profile & Bio',
  'Media',
  'Pricing',
  'Location',
  'Review',
]

const CATEGORIES = [
  { slug: 'bollywood-band', label: 'Bollywood Band', emoji: '🎸' },
  { slug: 'dj', label: 'DJ', emoji: '🎧' },
  { slug: 'ghazal', label: 'Ghazal Singer', emoji: '🎙️' },
  { slug: 'classical', label: 'Classical Music', emoji: '🎻' },
  { slug: 'folk', label: 'Folk Music', emoji: '🪗' },
  { slug: 'wedding-specialist', label: 'Wedding Specialist', emoji: '💍' },
  { slug: 'dancer', label: 'Dancer', emoji: '💃' },
  { slug: 'comedian', label: 'Comedian', emoji: '😄' },
  { slug: 'dhol', label: 'Dhol Player', emoji: '🥁' },
  { slug: 'fire-performer', label: 'Fire Performer', emoji: '🔥' },
  { slug: 'childrens-act', label: "Children's Act", emoji: '🎪' },
  { slug: 'corporate-speaker', label: 'Corporate Speaker', emoji: '🎤' },
  { slug: 'motivational', label: 'Motivational Speaker', emoji: '💪' },
  { slug: 'emcee', label: 'Emcee / Host', emoji: '🎙️' },
  { slug: 'wedding-host', label: 'Wedding Host', emoji: '🥂' },
  { slug: 'standup', label: 'Stand-Up Comedy', emoji: '🎭' },
  { slug: 'sound-light', label: 'Sound & Light', emoji: '💡' },
  { slug: 'decor', label: 'Decor', emoji: '🌸' },
  { slug: 'photographer', label: 'Photographer', emoji: '📸' },
  { slug: 'catering', label: 'Catering', emoji: '🍽️' },
  { slug: 'photo-booth', label: 'Photo Booth', emoji: '📷' },
]

const LANGUAGES = ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Gujarati', 'Punjabi', 'Malayalam', 'Urdu', 'Odia']

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Surat', 'Chandigarh',
  'Kochi', 'Nagpur', 'Bhopal', 'Indore', 'Visakhapatnam', 'Coimbatore',
]

const INDIAN_STATES = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal',
  'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Punjab', 'Kerala', 'Madhya Pradesh',
]

export default function ProviderJoinPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [generatingBio, setGeneratingBio] = useState(false)

  // Form state
  const [entityType, setEntityType] = useState<EntityType>('individual')
  const [displayName, setDisplayName] = useState('')
  const [bandName, setBandName] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [bullet1, setBullet1] = useState('')
  const [bullet2, setBullet2] = useState('')
  const [bullet3, setBullet3] = useState('')
  const [generatedBio, setGeneratedBio] = useState('')
  const [baseRate, setBaseRate] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [travelRadius, setTravelRadius] = useState('50')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [instruments, setInstruments] = useState('')

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    )
  }

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    )
  }

  const generateBio = async () => {
    if (!bullet1 && !bullet2) return
    setGeneratingBio(true)
    try {
      const res = await fetch('/api/ai/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bullets: [bullet1, bullet2, bullet3].filter(Boolean),
          category: selectedCategories[0] ?? 'musician',
          city,
        }),
      })
      const data = await res.json()
      setGeneratedBio(data.bio)
    } catch {
      alert('Bio generation failed. Please try again.')
    } finally {
      setGeneratingBio(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const res = await fetch('/api/artists/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: user.id,
          entity_type: entityType,
          display_name: displayName,
          band_name: bandName || null,
          categories: selectedCategories,
          ai_generated_bio: generatedBio,
          instruments: instruments.split(',').map((i) => i.trim()).filter(Boolean),
          base_rate_inr: parseInt(baseRate) || 0,
          hourly_rate_inr: hourlyRate ? parseInt(hourlyRate) : null,
          travel_radius_km: parseInt(travelRadius),
          city,
          state,
          languages,
        }),
      })

      if (res.ok) {
        router.push('/provider/dashboard')
      } else {
        alert('Registration failed. Please try again.')
      }
    } catch {
      alert('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const stepContent = [
    // Step 0: Basic Info
    <div key="basic" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Welcome to Sohala</h2>
        <p className="text-text-muted">Let's set up your artist profile</p>
      </div>
      <div>
        <label className="text-sm font-medium text-text-secondary mb-3 block">I am a...</label>
        <div className="grid grid-cols-3 gap-3">
          {([
            { key: 'individual', label: 'Solo Artist', emoji: '🎤' },
            { key: 'band', label: 'Band / Group', emoji: '🎸' },
            { key: 'agency', label: 'Agency', emoji: '🏢' },
          ] as { key: EntityType; label: string; emoji: string }[]).map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setEntityType(key)}
              className={`p-4 rounded-2xl border text-center transition-all duration-200 ${
                entityType === key
                  ? 'border-accent bg-accent/10 text-white'
                  : 'border-white/10 bg-card hover:border-white/20 text-text-secondary'
              }`}
            >
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="text-sm font-medium">{label}</div>
            </button>
          ))}
        </div>
      </div>
      <Input
        label="Display Name / Stage Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="e.g. Arijit Singh, The Band Wagon"
        required
      />
      {entityType === 'band' && (
        <Input
          label="Band / Group Name"
          value={bandName}
          onChange={(e) => setBandName(e.target.value)}
          placeholder="Official band name"
        />
      )}
      <Input
        label="Instruments (optional)"
        value={instruments}
        onChange={(e) => setInstruments(e.target.value)}
        placeholder="Guitar, Tabla, Harmonium (comma separated)"
      />
    </div>,

    // Step 1: Categories
    <div key="categories" className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">What do you do?</h2>
        <p className="text-text-muted">Select all that apply — you can add more later</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {CATEGORIES.map(({ slug, label, emoji }) => (
          <button
            key={slug}
            onClick={() => toggleCategory(slug)}
            className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${
              selectedCategories.includes(slug)
                ? 'border-accent bg-accent/10 text-white'
                : 'border-white/10 bg-card text-text-secondary hover:text-white hover:border-white/20'
            }`}
          >
            <span>{emoji}</span>
            <span className="text-left leading-tight">{label}</span>
            {selectedCategories.includes(slug) && <Check className="h-3 w-3 ml-auto flex-shrink-0 text-accent" />}
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Profile & Bio
    <div key="bio" className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Tell Your Story</h2>
        <p className="text-text-muted">Enter 3 key facts and our AI will craft your bio</p>
      </div>
      <Input label="Fact 1 — Your specialty / background" value={bullet1} onChange={(e) => setBullet1(e.target.value)} placeholder="e.g. 10 years performing Bollywood and ghazal..." />
      <Input label="Fact 2 — Notable achievements or events" value={bullet2} onChange={(e) => setBullet2(e.target.value)} placeholder="e.g. Performed at Taj Hotels, IIM events..." />
      <Input label="Fact 3 — Your unique style/offering" value={bullet3} onChange={(e) => setBullet3(e.target.value)} placeholder="e.g. Specialise in live looping with Indian instruments..." />
      <Button variant="secondary" size="md" onClick={generateBio} loading={generatingBio} disabled={!bullet1} className="gap-2">
        <Sparkles className="h-4 w-4" />
        Generate AI Bio
      </Button>
      {generatedBio && (
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl">
          <p className="text-xs text-accent mb-2 flex items-center gap-1"><Sparkles className="h-3 w-3" />AI Generated Bio</p>
          <p className="text-text-secondary text-sm leading-relaxed">{generatedBio}</p>
        </div>
      )}
    </div>,

    // Step 3: Media
    <div key="media" className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Showcase Your Work</h2>
        <p className="text-text-muted">Upload photos, a short performance video, and audio samples</p>
      </div>
      {[
        { label: 'Profile Photo', accept: 'image/*', icon: '📸' },
        { label: '10-second Performance Video', accept: 'video/*', icon: '🎬' },
        { label: 'Audio Sample', accept: 'audio/*', icon: '🎵' },
      ].map(({ label, accept, icon }) => (
        <div key={label} className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-accent/30 transition-colors cursor-pointer">
          <Upload className="h-8 w-8 text-text-muted mx-auto mb-2" />
          <p className="text-white font-medium mb-1">{icon} {label}</p>
          <p className="text-text-muted text-sm">Click to upload or drag and drop</p>
          <input type="file" accept={accept} className="hidden" />
        </div>
      ))}
      <p className="text-text-muted text-xs text-center">Media upload via direct URL is supported — full file upload in production</p>
    </div>,

    // Step 4: Pricing
    <div key="pricing" className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Set Your Rates</h2>
        <p className="text-text-muted">These are starting rates — you can negotiate per gig</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Base Rate (₹ per event)"
          type="number"
          value={baseRate}
          onChange={(e) => setBaseRate(e.target.value)}
          placeholder="e.g. 15000"
        />
        <Input
          label="Hourly Rate (₹ optional)"
          type="number"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          placeholder="e.g. 3000"
        />
      </div>
      <Input
        label="Travel Radius (km)"
        type="number"
        value={travelRadius}
        onChange={(e) => setTravelRadius(e.target.value)}
        placeholder="50"
        min="10"
        max="500"
      />
      <p className="text-text-muted text-xs">
        💡 Tip: Artists in Mumbai average ₹8,000–₹25,000 per event. Delhi averages ₹10,000–₹30,000.
      </p>
    </div>,

    // Step 5: Location
    <div key="location" className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Your Location</h2>
        <p className="text-text-muted">Where are you based?</p>
      </div>
      <div>
        <label className="text-sm font-medium text-text-secondary mb-2 block">City</label>
        <div className="flex flex-wrap gap-2">
          {INDIAN_CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                city === c ? 'bg-accent border-accent text-white' : 'border-white/10 text-text-secondary hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-text-secondary mb-2 block">State</label>
        <div className="flex flex-wrap gap-2">
          {INDIAN_STATES.map((s) => (
            <button
              key={s}
              onClick={() => setState(s)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                state === s ? 'bg-accent border-accent text-white' : 'border-white/10 text-text-secondary hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-text-secondary mb-2 block">Languages</label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => toggleLanguage(lang)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                languages.includes(lang) ? 'bg-accent border-accent text-white' : 'border-white/10 text-text-secondary hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 6: Review
    <div key="review" className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Review & Submit</h2>
        <p className="text-text-muted">Your profile will be reviewed within 24 hours</p>
      </div>
      <div className="bg-card-hover rounded-2xl p-4 space-y-3 text-sm">
        <div className="flex justify-between"><span className="text-text-muted">Name</span><span className="text-white">{displayName}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Type</span><span className="text-white capitalize">{entityType}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Categories</span><span className="text-white">{selectedCategories.length} selected</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Base Rate</span><span className="text-white">₹{parseInt(baseRate || '0').toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">City</span><span className="text-white">{city}, {state}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Languages</span><span className="text-white">{languages.join(', ')}</span></div>
      </div>
      {generatedBio && (
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
          <p className="text-xs text-accent mb-1">AI Bio</p>
          <p className="text-text-secondary text-sm">{generatedBio}</p>
        </div>
      )}
      <div className="p-4 bg-accent-green/10 border border-accent-green/20 rounded-xl text-sm text-accent-green">
        ✓ Your profile will go live after admin verification (typically within 24 hours)
      </div>
    </div>,
  ]

  return (
    <div className="min-h-screen bg-primary py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step ? 'bg-accent-green text-white' : i === step ? 'bg-accent text-white' : 'bg-white/10 text-text-muted'
                  }`}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-6 sm:w-10 ${i < step ? 'bg-accent-green' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {STEPS.map((s, i) => (
              <span key={s} className={`text-xs hidden sm:block ${i === step ? 'text-white' : 'text-text-muted'}`}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-card border border-white/5 rounded-3xl p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {stepContent[step]}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setStep(step - 1)}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => setStep(step + 1)}
                disabled={step === 0 && !displayName}
                className="flex-1 gap-2"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                loading={loading}
                className="flex-1"
              >
                Submit Application
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
