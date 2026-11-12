import type { Metadata } from 'next'
import './globals.css'
import './premium.css'
import './catalogue.css'

export const metadata: Metadata = {
  title: {
    default: 'LoreZone — Every world. Every story.',
    template: '%s | LoreZone',
  },
  description:
    'Discover anime, manga, films, spin-offs and the connections between them. Explore every story universe in one destination.',
  applicationName: 'LoreZone',
  keywords: ['anime', 'manga', 'franchises', 'story universes', 'connected stories'],
  openGraph: {
    title: 'LoreZone — Every world. Every story.',
    description:
      'Discover anime, manga, films, spin-offs and the connections between them.',
    siteName: 'LoreZone',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LoreZone — Every world. Every story.',
    description: 'Explore the storyverse.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
