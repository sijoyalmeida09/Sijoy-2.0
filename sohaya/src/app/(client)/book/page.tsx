'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, Calendar, MapPin, DollarSign, User, Smartphone, Sparkles, Copy, CheckCircle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { Provider } from '@/types'
import { formatCurrency } from '@/lib/utils'
import QRCode from 'qrcode'

type Step = 1 | 2 | 3 | 4

const STEPS = [
  { n: 1, label: 'Event Details', icon: Calendar },
  { n: 2, label: 'Review Quote', icon: User },
  { n: 3, label: 'Payment', icon: Smartphone },
  { n: 4, label: 'Confirmed', icon: Check },
]

const EVENT_TYPES = [
  'Wedding', 'Sangeet', 'Reception', 'Corporate', 'Birthday',
  'Anniversary', 'Engagement', 'Restaurant', 'Small Party',
]

const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID ?? 'sijoyalmeida-1@oksbi'
const UPI_NAME = process.env.NEXT_PUBLIC_UPI_NAME ?? 'Sohaya'

function buildUpiString(amount: number, ref: string) {
  return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Sohaya Booking ' + ref)}`
}

function UpiPaymentStep({
  amount,
  bookingId,
  onSuccess,
}: {
  amount: number
  bookingId: string
  onSuccess: () => void
}) {
  const qrRef = useRef<HTMLCanvasElement>(null)
  const [utr, setUtr] = useState('')
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const upiString = buildUpiString(amount, bookingId.slice(-8).toUpperCase())

  useEffect(() => {
    if (qrRef.current) {
      QRCode.toCanvas(qrRef.current, upiString, {
        width: 220,
        margin: 2,
        color: { dark: '#ffffff', light: '#1a1a2e' },
      })
    }
  }, [upiString])

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmitUtr = async () => {
    if (utr.trim().length < 6) {
      setError('Please enter a valid UTR / transaction ID')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, utr }),
      })
      if (!res.ok) throw new Error()
      onSuccess()
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Amount */}
      <div className="text-center">
        <p className="text-text-muted text-sm mb-1">Pay exactly</p>
        <p className="text-4xl font-bold text-white">{formatCurrency(amount)}</p>
        <p className="text-xs text-text-muted mt-1">Ref: {bookingId.slice(-8).toUpperCase()}</p>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-3">
        <div className="p-3 bg-[#1a1a2e] rounded-2xl border border-white/10 inline-block">
          <canvas ref={qrRef} className="rounded-lg" />
        </div>
        <p className="text-xs text-text-muted">Scan with any UPI app (GPay, PhonePe, Paytm)</p>
      </div>

      {/* UPI ID copy */}
      <div className="flex items-center gap-2 p-3 bg-card-hover rounded-xl border border-white/10">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-muted mb-0.5">UPI ID</p>
          <p className="text-sm font-mono text-white truncate">{UPI_ID}</p>
        </div>
        <button
          onClick={copyUpiId}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0"
        >
          {copied ? <CheckCircle className="h-4 w-4 text-accent-green" /> : <Copy className="h-4 w-4 text-text-muted" />}
        </button>
      </div>

      {/* Pay via app button */}
      <a
        href={upiString}
        className="block w-full py-4 rounded-2xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-center transition-colors flex items-center justify-center gap-2"
      >
        <Smartphone className="h-5 w-5" />
        Open UPI App to Pay
      </a>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-text-muted">after paying, enter your transaction ID</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* UTR input */}
      <div className="space-y-3">
        <Input
          label="Transaction ID / UTR"
          value={utr}
          onChange={(e) => setUtr(e.target.value)}
          placeholder="e.g. 506241987654 (from your GPay)"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSubmitUtr}
          loading={submitting}
          disabled={!utr.trim()}
        >
          I've Paid — Confirm Booking
          <ChevronRight className="h-4 w-4" />
        </Button>
        <p className="text-xs text-text-muted text-center">
          Your booking will be confirmed within 30 minutes after we verify the payment.
        </p>
      </div>
    </div>
  )
}

export default function BookPage() {
  const params = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const providerId = params.get('provider')

  const [step, setStep] = useState<Step>(1)
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)

  const [eventType, setEventType] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [duration, setDuration] = useState('3')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [notes, setNotes] = useState('')
  const [quoteAmount, setQuoteAmount] = useState<number | null>(null)

  // Guest user info (shown when not logged in)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    if (providerId) {
      supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single()
        .then(({ data }) => setProvider(data))
    }
  }, [providerId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user)
      setAuthLoading(false)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmitLead = async () => {
    setLoading(true)
    try {
      // If guest, sign them up first
      if (!currentUser) {
        if (!guestName || !guestEmail) {
          alert('Please enter your name and email to continue.')
          setLoading(false)
          return
        }
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: guestEmail,
          password: Math.random().toString(36).slice(-10) + 'A1!',
          options: { data: { full_name: guestName, role: 'client' } },
        })
        if (signUpError && !signUpError.message.includes('already registered')) {
          alert('Could not create account: ' + signUpError.message)
          setLoading(false)
          return
        }
        // If already exists, sign them in via magic link flow — just proceed, leads API will use existing session
        if (signUpData?.user) {
          setCurrentUser(signUpData.user)
          // Update profile with phone if provided
          if (guestPhone) {
            await supabase.from('profiles').upsert({
              id: signUpData.user.id,
              email: guestEmail,
              full_name: guestName,
              phone: guestPhone,
              role: 'client',
            })
          }
        }
      }

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType.toLowerCase().replace(' ', '_'),
          event_date: eventDate,
          event_time: eventTime,
          duration_hours: parseFloat(duration),
          location_text: location,
          budget_hint_inr: budget ? parseInt(budget) : undefined,
          notes,
          provider_id: providerId,
        }),
      })
      if (!res.ok) throw new Error()
      setQuoteAmount(provider ? Math.ceil(provider.base_rate_inr * 1.15) : 0)
      setStep(2)
    } catch {
      alert('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToPayment = async () => {
    if (!quoteAmount) return
    setLoading(true)
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_inr: quoteAmount,
          provider_id: providerId,
          event_type: eventType,
          event_date: eventDate,
          location_text: location,
        }),
      })
      const data = await res.json()
      setBookingId(data.booking_id)
      setStep(3)
    } catch {
      alert('Failed to prepare payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Steps Indicator */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map(({ n, label, icon: Icon }) => (
            <div key={n} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step === n
                      ? 'bg-accent text-white ring-4 ring-accent/20'
                      : step > n
                      ? 'bg-accent-green text-white'
                      : 'bg-card border border-white/10 text-text-muted'
                  }`}
                >
                  {step > n ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${step === n ? 'text-white' : 'text-text-muted'}`}>
                  {label}
                </span>
              </div>
              {n < 4 && (
                <div
                  className={`h-px w-12 sm:w-20 mx-2 transition-colors duration-300 ${
                    step > n ? 'bg-accent-green' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Event Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card border border-white/5 rounded-3xl p-8 space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Event Details</h2>
                <p className="text-text-muted text-sm">Tell us about your celebration</p>
              </div>

              {provider && (
                <div className="flex items-center gap-3 p-3 bg-card-hover rounded-xl border border-white/5">
                  <div className="h-12 w-12 rounded-xl bg-card overflow-hidden flex-shrink-0">
                    {provider.photo_urls?.[0] && (
                      <img src={provider.photo_urls[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{provider.display_name}</div>
                    <div className="text-text-muted text-xs">{provider.city} · from {formatCurrency(provider.base_rate_inr)}</div>
                  </div>
                </div>
              )}

              {/* Guest Details (shown when not logged in) */}
              {!authLoading && !currentUser && (
                <div className="space-y-4 p-4 bg-accent/5 border border-accent/20 rounded-2xl">
                  <p className="text-sm font-medium text-accent">Enter your details to continue</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Your Name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Priya Sharma"
                      required
                      icon={<User className="h-4 w-4" />}
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="9876543210"
                      icon={<Phone className="h-4 w-4" />}
                    />
                  </div>
                  <Input
                    label="Email Address"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                  <p className="text-xs text-text-muted">We'll create a free account so you can track your booking.</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-text-secondary mb-2 block">Event Type</label>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setEventType(type)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        eventType === type
                          ? 'bg-accent text-white'
                          : 'bg-white/5 border border-white/10 text-text-secondary hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Event Date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Input
                  label="Event Time"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Duration (hours)"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  max="12"
                  step="0.5"
                />
                <Input
                  label="Budget (₹)"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 50000"
                  icon={<DollarSign className="h-4 w-4" />}
                />
              </div>

              <Input
                label="Venue / Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. The Grand Hotel, Mumbai"
                icon={<MapPin className="h-4 w-4" />}
              />

              <Input
                label="Special Requests (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requirements, songs, attire..."
              />

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleSubmitLead}
                loading={loading}
                disabled={!eventType || !eventDate || !location}
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Quote Review */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card border border-white/5 rounded-3xl p-8 space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Review Quote</h2>
                <p className="text-text-muted text-sm">Confirm your booking details</p>
              </div>

              {provider && (
                <div className="space-y-4">
                  <div className="bg-card-hover rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Artist</span>
                      <span className="text-white font-medium">{provider.display_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Event</span>
                      <span className="text-white font-medium">{eventType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Date</span>
                      <span className="text-white font-medium">{new Date(eventDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Duration</span>
                      <span className="text-white font-medium">{duration} hours</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Venue</span>
                      <span className="text-white font-medium">{location}</span>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex justify-between">
                      <span className="text-text-secondary font-semibold">Total Amount</span>
                      <span className="text-xl font-bold text-white">{formatCurrency(quoteAmount ?? 0)}</span>
                    </div>
                    <p className="text-xs text-text-muted">Includes platform service fee. All taxes applicable.</p>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-accent-green/10 border border-accent-green/20 rounded-xl">
                    <Sparkles className="h-4 w-4 text-accent-green flex-shrink-0" />
                    <p className="text-xs text-accent-green">
                      Your booking is secured by Sohaya's guarantee. Pay only after you're satisfied.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button variant="primary" size="lg" onClick={handleProceedToPayment} loading={loading} className="flex-1">
                  Proceed to Pay
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: UPI Payment */}
          {step === 3 && bookingId && quoteAmount && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card border border-white/5 rounded-3xl p-8"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Pay via UPI</h2>
                <p className="text-text-muted text-sm">Google Pay · PhonePe · Paytm · Any UPI app</p>
              </div>
              <UpiPaymentStep
                amount={quoteAmount}
                bookingId={bookingId}
                onSuccess={() => setStep(4)}
              />
            </motion.div>
          )}

          {/* Step 4: Pending Verification */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-accent-green/20 rounded-3xl p-8 space-y-6 text-center"
            >
              <div className="h-20 w-20 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-10 w-10 text-accent-green" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Payment Submitted!</h2>
                <p className="text-text-secondary">
                  We've received your transaction ID. {provider?.display_name} will be confirmed once we verify your payment — usually within 30 minutes.
                </p>
              </div>
              <div className="space-y-1.5 p-4 bg-card-hover rounded-2xl text-left">
                <p className="text-sm text-text-muted mb-2">What happens next:</p>
                {[
                  '🔍 We verify your UPI payment',
                  '✅ Booking confirmed + artist notified',
                  '📞 Artist will call you within 2 hours',
                  '🎵 Enjoy your celebration!',
                ].map((s) => (
                  <p key={s} className="text-sm text-text-secondary">{s}</p>
                ))}
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => router.push(currentUser ? '/discover' : '/')}
              >
                View My Bookings
              </Button>
              <a
                href="https://wa.me/917021234567?text=Hi%20Sohaya!%20I%20just%20booked%20an%20artist%20and%20have%20a%20question."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-sm font-medium hover:bg-[#25D366]/20 transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp for help
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
