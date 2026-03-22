'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Save, Camera, Plus, Trash2, Music, MapPin, DollarSign,
  Languages, Tag, Upload, CheckCircle, AlertCircle, X
} from 'lucide-react'

const CATEGORIES = [
  'bollywood-band', 'classical-music', 'folk-music', 'dj', 'ghazal',
  'classical-dance', 'folk-dance', 'dhol-player', 'emcee', 'comedian',
  'photographer', 'sound-light', 'corporate-speaker', 'kirtan-group',
  'qawwali', 'magician', 'mehendi-artist', 'makeup-artist', 'wedding-planner',
  'decoration', 'pandit', 'kids-entertainer', 'influencer', 'instagram-influencer',
  'youtube-creator', 'content-creator', 'celebrity', 'street-artist',
  'live-kitchen', 'bartender', 'acrobat',
]

const CITIES = ['Vasai', 'Mumbai', 'Thane', 'Navi Mumbai', 'Pune', 'Nashik', 'Goa', 'Bangalore', 'Delhi', 'Hyderabad', 'Jaipur', 'Chennai', 'Kolkata', 'Lucknow']
const LANGUAGES = ['Hindi', 'English', 'Marathi', 'Gujarati', 'Konkani', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Punjabi', 'Urdu', 'Malayalam']

export default function ProfileEditPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [provider, setProvider] = useState<Record<string, any> | null>(null)

  // Editable fields
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [baseRate, setBaseRate] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [travelRadius, setTravelRadius] = useState('50')
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState('')

  // Portfolio
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [newSong, setNewSong] = useState('')

  useEffect(() => {
    loadProfile()
  }, []) // eslint-disable-line

  async function loadProfile() {
    const res = await fetch('/api/artists/profile')
    if (res.ok) {
      const data = await res.json()
      setProvider(data)
      setDisplayName(data.display_name || '')
      setBio(data.ai_generated_bio || data.bio || '')
      setCategories(data.categories || [])
      setCity(data.city || '')
      setState(data.state || '')
      setLanguages(data.languages || [])
      setBaseRate(String(data.base_rate_inr || ''))
      setHourlyRate(String(data.hourly_rate_inr || ''))
      setTravelRadius(String(data.travel_radius_km || 50))
      setPhotoUrls(data.photo_urls || [])
      setVideoUrl(data.video_preview_url || '')
      setPortfolio(data.portfolio || [])
    }
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)

    const res = await fetch('/api/artists/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        display_name: displayName,
        ai_generated_bio: bio,
        categories,
        city,
        state,
        languages,
        base_rate_inr: Number(baseRate) || 0,
        hourly_rate_inr: Number(hourlyRate) || null,
        travel_radius_km: Number(travelRadius) || 50,
        photo_urls: photoUrls,
        video_preview_url: videoUrl || null,
      }),
    })

    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      const data = await res.json()
      setError(data.error || 'Save failed')
    }
    setSaving(false)
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('artist-media')
      .upload(path, file, { contentType: file.type })

    if (uploadError) {
      setError('Upload failed: ' + uploadError.message)
    } else {
      const { data: { publicUrl } } = supabase.storage.from('artist-media').getPublicUrl(path)
      setPhotoUrls(prev => [...prev, publicUrl])
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function removePhoto(idx: number) {
    setPhotoUrls(prev => prev.filter((_, i) => i !== idx))
  }

  function toggleCategory(cat: string) {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  function toggleLanguage(lang: string) {
    setLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    )
  }

  async function addSetlistSong() {
    if (!newSong.trim() || !provider) return
    const res = await fetch('/api/artists/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_type: 'setlist_song',
        title: newSong.trim(),
      }),
    })
    if (res.ok) {
      const item = await res.json()
      setPortfolio(prev => [...prev, item])
      setNewSong('')
    }
  }

  async function removePortfolioItem(id: string) {
    await fetch('/api/artists/portfolio', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setPortfolio(prev => prev.filter(p => p.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-white mb-2">No Profile Found</h2>
        <p className="text-text-muted mb-4">Register as an artist first.</p>
        <Button variant="primary" onClick={() => router.push('/provider/join')}>Join as Artist</Button>
      </div>
    )
  }

  const completeness = provider.profile_completeness || 0

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
          <p className="text-text-muted text-sm mt-1">
            {completeness}% complete
            <span className="ml-2 text-text-muted">
              {provider.status === 'verified' ? '✓ Verified' : provider.status === 'pending' ? '⏳ Pending' : '✗ ' + provider.status}
            </span>
          </p>
        </div>
        <Button variant="primary" loading={saving} onClick={handleSave}>
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </div>

      {/* Saved / Error */}
      {saved && (
        <div className="flex items-center gap-2 p-3 bg-accent-green/10 border border-accent-green/20 rounded-xl text-accent-green text-sm">
          <CheckCircle className="h-4 w-4" /> Profile saved!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Progress bar */}
      <div className="h-2 bg-card rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-accent to-accent-green transition-all" style={{ width: `${completeness}%` }} />
      </div>

      {/* Photos */}
      <section className="bg-card border border-white/5 rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold text-white flex items-center gap-2"><Camera className="h-4 w-4 text-accent" /> Photos</h3>
        <div className="flex flex-wrap gap-3">
          {photoUrls.map((url, i) => (
            <div key={i} className="relative h-24 w-24 rounded-xl overflow-hidden group">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 h-6 w-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="h-24 w-24 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 hover:border-accent/50 transition-colors"
          >
            {uploading ? (
              <div className="h-5 w-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Upload className="h-5 w-5 text-text-muted" />
                <span className="text-[10px] text-text-muted">Add Photo</span>
              </>
            )}
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
      </section>

      {/* Basic Info */}
      <section className="bg-card border border-white/5 rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2"><Music className="h-4 w-4 text-accent" /> Basic Info</h3>
        <Input label="Display Name / Stage Name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
        <div>
          <label className="block text-sm text-text-muted mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={4}
            className="w-full bg-card-hover border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent/50 resize-none"
            placeholder="Tell your story..."
          />
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1">Video Preview URL</label>
          <input
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            className="w-full bg-card-hover border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent/50"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
      </section>

      {/* Categories */}
      <section className="bg-card border border-white/5 rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold text-white flex items-center gap-2"><Tag className="h-4 w-4 text-accent" /> Categories</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                categories.includes(cat)
                  ? 'bg-accent text-white'
                  : 'bg-white/5 text-text-muted hover:bg-white/10'
              }`}
            >
              {cat.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-card border border-white/5 rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2"><DollarSign className="h-4 w-4 text-accent" /> Pricing</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Base Rate (₹/event)" type="number" value={baseRate} onChange={e => setBaseRate(e.target.value)} />
          <Input label="Hourly Rate (₹/hr)" type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} />
        </div>
        <Input label="Travel Radius (km)" type="number" value={travelRadius} onChange={e => setTravelRadius(e.target.value)} />
      </section>

      {/* Location */}
      <section className="bg-card border border-white/5 rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold text-white flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Location</h3>
        <div className="flex flex-wrap gap-2">
          {CITIES.map(c => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                city === c ? 'bg-accent text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="bg-card border border-white/5 rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold text-white flex items-center gap-2"><Languages className="h-4 w-4 text-accent" /> Languages</h3>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => toggleLanguage(lang)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                languages.includes(lang) ? 'bg-accent text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </section>

      {/* Setlist / Portfolio */}
      <section className="bg-card border border-white/5 rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold text-white flex items-center gap-2"><Music className="h-4 w-4 text-accent" /> Setlist / Portfolio</h3>
        <div className="space-y-2">
          {portfolio.filter(p => p.item_type === 'setlist_song').map(item => (
            <div key={item.id} className="flex items-center justify-between p-2 bg-card-hover rounded-lg">
              <span className="text-sm text-white">{item.title}</span>
              <button onClick={() => removePortfolioItem(item.id)} className="text-text-muted hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newSong}
            onChange={e => setNewSong(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSetlistSong()}
            className="flex-1 bg-card-hover border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-accent/50"
            placeholder="Add a song to your setlist..."
          />
          <Button variant="primary" size="sm" onClick={addSetlistSong}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Save button (bottom) */}
      <div className="sticky bottom-4">
        <Button variant="primary" size="lg" className="w-full" loading={saving} onClick={handleSave}>
          <Save className="h-4 w-4" /> Save All Changes
        </Button>
      </div>
    </div>
  )
}
