import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sohala — India\'s Premier Entertainment Marketplace',
  description:
    'Book verified artists, bands, DJs, speakers and event services for weddings, corporate events, and restaurants across India. Powered by AI.',
  keywords: [
    'book artists india',
    'wedding entertainment',
    'corporate events india',
    'bollywood band booking',
    'event entertainment marketplace',
    'sohala',
  ],
  openGraph: {
    title: 'Sohala — Your Celebration, Perfectly Performed',
    description: 'India\'s AI-powered entertainment marketplace',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-primary text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
