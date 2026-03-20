import Link from 'next/link'
import { Music, Instagram, Twitter, Youtube } from 'lucide-react'

const FOOTER_LINKS = {
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
  ],
  'For Artists': [
    { label: 'Join as Artist', href: '/provider/join' },
    { label: 'Artist Resources', href: '/artists/resources' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Go Live', href: '/provider/go-live' },
  ],
  'For Clients': [
    { label: 'Find Artists', href: '/discover' },
    { label: 'How it Works', href: '/#how-it-works' },
    { label: 'Wedding Packages', href: '/palettes' },
    { label: 'Corporate Events', href: '/discover?event=corporate' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-gradient-to-br from-accent to-red-700 rounded-lg flex items-center justify-center">
                <Music className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg gradient-text-red">Sohala</span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed mb-4">
              India's premier entertainment marketplace. Connecting celebrations with extraordinary performers.
            </p>
            <div className="flex gap-3">
              <a href="#" className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Instagram className="h-4 w-4 text-text-muted" />
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Twitter className="h-4 w-4 text-text-muted" />
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Youtube className="h-4 w-4 text-text-muted" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="font-semibold text-white text-sm mb-4">{section}</h3>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-text-muted hover:text-white text-sm transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            © 2026 Sohala Entertainment Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <span>Made with ❤️ in India</span>
            <span>•</span>
            <span>Available across 50+ cities</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
