import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LoreZone — Connected Universe Explorer',
  description: 'Explore anime, manga, comics, movies, games, and spin-offs as one connected experience.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
