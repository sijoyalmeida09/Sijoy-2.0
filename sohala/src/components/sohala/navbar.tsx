'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Music, Menu, X, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function Navbar({ user }: { user?: { id: string; email?: string } | null }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'navbar-solid' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-accent to-red-700 rounded-lg flex items-center justify-center">
              <Music className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text-red">Sohala</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/discover"
              className="text-text-secondary hover:text-white text-sm font-medium transition-colors"
            >
              Discover
            </Link>
            <Link
              href="/tonight"
              className="text-text-secondary hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <span className="h-2 w-2 rounded-full bg-accent-green animate-pulse" />
              Live Tonight
            </Link>
            <Link
              href="/provider/join"
              className="text-text-secondary hover:text-white text-sm font-medium transition-colors"
            >
              For Artists
            </Link>
            <Link
              href="/#how-it-works"
              className="text-text-secondary hover:text-white text-sm font-medium transition-colors"
            >
              How it Works
            </Link>
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/discover">
                  <Button variant="secondary" size="sm">
                    <User className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-text-muted hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-text-secondary hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-white/5 px-4 py-4 space-y-4">
          <Link
            href="/discover"
            className="block text-text-secondary hover:text-white py-2"
            onClick={() => setMobileOpen(false)}
          >
            Discover
          </Link>
          <Link
            href="/tonight"
            className="block text-text-secondary hover:text-white py-2"
            onClick={() => setMobileOpen(false)}
          >
            Live Tonight
          </Link>
          <Link
            href="/provider/join"
            className="block text-text-secondary hover:text-white py-2"
            onClick={() => setMobileOpen(false)}
          >
            For Artists
          </Link>
          <div className="flex gap-3 pt-2">
            {user ? (
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Log Out
              </Button>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm">Log In</Button>
                </Link>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
