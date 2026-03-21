import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sohaya — Celebrate Like We Do',
  description:
    'Vasaikar\'s celebration marketplace. Book verified artists, bands, DJs and performers for weddings, ceremonies, and celebrations across Vasai and Maharashtra.',
  keywords: [
    'vasaikar entertainment',
    'vasai wedding artists',
    'celebration marketplace',
    'book artists vasai',
    'bollywood band booking',
    'sohaya',
  ],
  openGraph: {
    title: 'Sohaya — Your Ceremony, Your Way',
    description: 'Vasaikar\'s AI-powered celebration marketplace',
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
