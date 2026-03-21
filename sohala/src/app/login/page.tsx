import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginForm } from './login-form'
import { Music } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; tab?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect(searchParams.redirect ?? '/discover')
  }

  return (
    <div className="min-h-screen bg-primary flex">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-red-950/50 to-primary items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(229,9,20,0.15),transparent_70%)]" />
        <div className="relative z-10 max-w-md text-center">
          <div className="h-16 w-16 bg-gradient-to-br from-accent to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Music className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            सोहया में आपका स्वागत है
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            Vasaikar's celebration marketplace. Book extraordinary artists for your ceremony and events.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[['500+', 'Artists'], ['50+', 'Cities'], ['4.8★', 'Rating']].map(([val, label]) => (
              <div key={label}>
                <div className="text-2xl font-bold gradient-text-red">{val}</div>
                <div className="text-xs text-text-muted mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="h-10 w-10 bg-gradient-to-br from-accent to-red-700 rounded-xl flex items-center justify-center">
              <Music className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text-red">Sohaya</span>
          </div>

          <LoginForm
            redirectTo={searchParams.redirect}
            defaultTab={(searchParams.tab as 'client' | 'artist') ?? 'client'}
          />
        </div>
      </div>
    </div>
  )
}
