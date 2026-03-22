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

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    } else {
      router.push(tab === 'artist' ? '/dashboard' : redirectTo)
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
    const mobile = formattedPhone.replace('+', '')

    try {
      // Use MSG91 OTP API directly
      const widgetId = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID
      const authkey = process.env.NEXT_PUBLIC_MSG91_AUTH_TOKEN

      if (!widgetId && !authkey) {
        // Fallback: try Supabase OTP (if Twilio/MSG91 hook configured)
        const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone })
        if (error) throw new Error(error.message)
      } else {
        // MSG91 Send OTP
        const res = await fetch(`https://control.msg91.com/api/v5/otp?template_id=${widgetId}&mobile=${mobile}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', authkey: authkey || '' },
        })
        const data = await res.json()
        if (data.type === 'error') throw new Error(data.message || 'Failed to send OTP')
      }

      setOtpSent(true)
      setSuccessMsg(`OTP sent to ${formattedPhone}`)
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
    const mobile = formattedPhone.replace('+', '')

    try {
      const widgetId = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID
      const authkey = process.env.NEXT_PUBLIC_MSG91_AUTH_TOKEN

      if (!widgetId && !authkey) {
        // Fallback: Supabase OTP verify
        const { error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token: otp, type: 'sms' })
        if (error) throw new Error(error.message)
      } else {
        // MSG91 Verify OTP
        const res = await fetch(`https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=${mobile}`, {
          headers: { authkey: authkey || '' },
        })
        const data = await res.json()
        if (data.type === 'error') throw new Error(data.message || 'Invalid OTP')

        // OTP verified — now sign in/up via Supabase with phone
        // Create or sign in the user with a deterministic password from phone
        const phoneEmail = `${mobile}@phone.sohaya.app`
        const phonePass = `PHONE_${mobile}_SOHAYA`

        // Try sign in first
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email: phoneEmail, password: phonePass })
        if (signInErr) {
          // Sign up
          const { error: signUpErr } = await supabase.auth.signUp({
            email: phoneEmail,
            password: phonePass,
            options: { data: { full_name: mobile, role: tab === 'artist' ? 'provider' : 'client', phone: formattedPhone } },
          })
          if (signUpErr) throw new Error(signUpErr.message)
        }
      }

      router.push(tab === 'artist' ? '/dashboard' : redirectTo)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Verification failed')
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
          {formMode === 'signup' ? 'Join Sohaya — it\'s free' : 'Sign in to your Sohaya account'}
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

      {/* Divider */}
      <div className="flex items-center gap-3 my-2">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-text-muted">or continue with</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors disabled:opacity-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

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
