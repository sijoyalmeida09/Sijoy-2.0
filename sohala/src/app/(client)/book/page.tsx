'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, Calendar, MapPin, DollarSign, User, Smartphone, Sparkles, Copy, CheckCircle } from 'lucide-react'
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

  const handleSubmitLead = async () => {
    setLoading(true)
    try {
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
                onClick={() => router.push('/dashboard/bookings')}
              >
                View My Bookings
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
