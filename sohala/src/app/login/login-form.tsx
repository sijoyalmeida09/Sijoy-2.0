'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Phone, Eye, EyeOff, ArrowRight, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

type AuthMode = 'email' | 'magic' | 'otp'
type UserTab = 'client' | 'artist'
type FormMode = 'signin' | 'signup'

interface LoginFormProps {
  redirectTo?: string
  defaultTab?: UserTab
}

export function LoginForm({ redirectTo = '/discover', defaultTab = 'client' }: LoginFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [tab, setTab] = useState<UserTab>(defaultTab)
  const [mode, setMode] = useState<AuthMode>('email')
  const [formMode, setFormMode] = useState<FormMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    } else {
      router.push(tab === 'artist' ? '/provider/dashboard' : redirectTo)
      router.refresh()
    }
    setLoading(false)
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?redirect=${redirectTo}` },
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccessMsg('Check your email for the magic link!')
    }
    setLoading(false)
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
    const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone })

    if (error) {
      setError(error.message)
    } else {
      setOtpSent(true)
      setSuccessMsg(`OTP sent to ${formattedPhone}`)
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'sms',
    })

    if (error) {
      setError(error.message)
    } else {
      router.push(tab === 'artist' ? '/provider/dashboard' : redirectTo)
      router.refresh()
    }
    setLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: tab === 'artist' ? 'provider' : 'client' },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          role: tab === 'artist' ? 'provider' : 'client',
        })
      }
      setSuccessMsg('Account created! Check your email to confirm, then sign in.')
      setFormMode('signin')
    }
    setLoading(false)
  }

  const switchMode = (m: FormMode) => {
    setFormMode(m)
    setError('')
    setSuccessMsg('')
  }

  return (
    <div className="bg-card border border-white/8 rounded-3xl p-8 shadow-2xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">
          {formMode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="text-text-muted text-sm">
          {formMode === 'signup' ? 'Join Sohala — it\'s free' : 'Sign in to your Sohala account'}
        </p>
      </div>

      {/* Tab: Client / Artist */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
        {(['client', 'artist'] as UserTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 capitalize ${
              tab === t ? 'bg-accent text-white' : 'text-text-muted hover:text-white'
            }`}
          >
            {t === 'client' ? 'Book an Artist' : 'I\'m an Artist'}
          </button>
        ))}
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'email', label: 'Email', icon: Mail },
          { key: 'magic', label: 'Magic Link', icon: Mail },
          { key: 'otp', label: 'Phone OTP', icon: Phone },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setMode(key as AuthMode); setError(''); setSuccessMsg('') }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === key ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white'
            }`}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="mb-4 p-3 bg-accent-green/10 border border-accent-green/20 rounded-xl text-accent-green text-sm">
          {successMsg}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Email + Password Form */}
      {mode === 'email' && (
        <form onSubmit={formMode === 'signup' ? handleSignup : handleEmailLogin} className="space-y-4">
          {formMode === 'signup' && (
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              icon={<User className="h-4 w-4" />}
              required
            />
          )}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 bottom-3 text-text-muted hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button variant="primary" size="lg" loading={loading} className="w-full">
            {formMode === 'signup' ? 'Create Account' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      )}

      {/* Magic Link Form */}
      {mode === 'magic' && (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Button variant="primary" size="lg" loading={loading} className="w-full">
            Send Magic Link
          </Button>
        </form>
      )}

      {/* OTP Form */}
      {mode === 'otp' && (
        <div className="space-y-4">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                icon={<Phone className="h-4 w-4" />}
                required
              />
              <p className="text-xs text-text-muted">We'll send a 6-digit OTP to +91{phone}</p>
              <Button variant="primary" size="lg" loading={loading} className="w-full">
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <Input
                label="Enter OTP"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
              />
              <Button variant="primary" size="lg" loading={loading} className="w-full">
                Verify OTP
              </Button>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-xs text-text-muted hover:text-white text-center"
              >
                Resend OTP
              </button>
            </form>
          )}
        </div>
      )}

      {/* Footer Links */}
      <div className="mt-6 text-center space-y-2">
        {formMode === 'signin' ? (
          <p className="text-text-muted text-sm">
            Don&apos;t have an account?{' '}
            <button onClick={() => switchMode('signup')} className="text-accent hover:underline font-medium">
              Sign Up Free
            </button>
          </p>
        ) : (
          <p className="text-text-muted text-sm">
            Already have an account?{' '}
            <button onClick={() => switchMode('signin')} className="text-accent hover:underline font-medium">
              Sign In
            </button>
          </p>
        )}
        {tab === 'artist' && formMode === 'signin' && (
          <p className="text-text-muted text-sm">
            New artist?{' '}
            <Link href="/provider/join" className="text-accent-green hover:underline">
              Join as Artist →
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
