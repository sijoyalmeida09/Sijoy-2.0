'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Inbox,
  FileText,
  CalendarDays,
  DollarSign,
  User,
  Zap,
  Music,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'My Leads', icon: Inbox, badge: null },
  { href: '/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/go-live', label: 'Go Live', icon: Zap, highlight: true },
]

export function ProviderSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="w-60 min-h-screen bg-card border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-br from-accent to-red-700 rounded-lg flex items-center justify-center">
            <Music className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg gradient-text-red">Sohaya</span>
        </Link>
        <p className="text-xs text-text-muted mt-1">Artist Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon, highlight }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-accent/15 text-accent border border-accent/20'
                  : highlight
                  ? 'text-accent-green hover:bg-accent-green/10'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className={cn('h-4 w-4', highlight && !isActive && 'text-accent-green')} />
              {label}
              {highlight && (
                <span className="ml-auto h-2 w-2 rounded-full bg-accent-green animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-white hover:bg-white/5 w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </aside>
  )
}
