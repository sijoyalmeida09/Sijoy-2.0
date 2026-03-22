'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Play, Zap, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/discover', icon: Search, label: 'Discover' },
  { href: '/reels', icon: Play, label: 'Reels', accent: true },
  { href: '/tonight', icon: Zap, label: 'Live' },
  { href: '/bookings', icon: User, label: 'You' },
]

export function BottomNav({ userRole }: { userRole?: string | null }) {
  const pathname = usePathname()

  // Hide on provider/admin pages and booking flow
  const hidePaths = ['/dashboard', '/leads', '/earnings', '/go-live', '/profile', '/admin', '/book', '/login', '/join']
  if (hidePaths.some(p => pathname.startsWith(p))) return null

  // Adjust "You" link based on role
  const items = NAV_ITEMS.map(item => {
    if (item.label === 'You') {
      if (userRole === 'provider') return { ...item, href: '/dashboard', label: 'Studio' }
      if (userRole === 'admin') return { ...item, href: '/admin', label: 'Admin' }
    }
    return item
  })

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/95 backdrop-blur-lg border-t border-white/5 safe-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {items.map(({ href, icon: Icon, label, accent }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${
                isActive ? 'text-accent' : 'text-white/50'
              }`}
            >
              {accent && !isActive ? (
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-accent to-red-700 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-white" />
                </div>
              ) : (
                <Icon className={`h-5 w-5 ${isActive ? 'text-accent' : ''}`} />
              )}
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
