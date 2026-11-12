'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import TitleCard from '../../components/TitleCard'
import { Title, MediaType } from '../types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const MEDIA_TYPES: MediaType[] = [
  'anime', 'manga', 'movie', 'ova', 'ona', 'special',
  'manhwa', 'novel', 'spin_off', 'comic', 'game', 'series',
]

export default function TitlesPage() {
  const [titles, setTitles] = useState<Title[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    const endpoint = filter === 'all'
      ? \`\${API}/api/titles?limit=60\`
      : \`\${API}/api/titles?media_type=\${encodeURIComponent(filter)}&limit=60\`

    fetch(endpoint, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Could not load catalogue')
        return response.json()
      })
      .then(data => {
        if (!controller.signal.aborted) setTitles(data.data || [])
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [filter])

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-shell">
        <section className="page-intro">
          <p className="eyebrow">THE LOREZONE LIBRARY</p>
          <h1>Browse the catalogue.</h1>
          <p>Explore the original works, adaptations, films and spin-offs connected to the universes in LoreZone.</p>
          <div className="catalogue-intro-stat"><span>{titles.length}</span> {loading ? 'Loading titles' : 'titles in this view'}</div>
        </section>

        <div className="filter-row" role="tablist" aria-label="Filter catalogue by media type">
          {['all', ...MEDIA_TYPES].map(type => (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={filter === type}
              onClick={() => setFilter(type)}
              className={\`filter-pill \${filter === type ? 'is-active' : ''}\`}
            >
              {type === 'all' ? 'Everything' : type.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="title-library-grid">
            {Array.from({ length: 18 }).map((_, index) => (
              <div key={index} className="poster-skeleton">
                <div className="poster-skeleton__image" />
                <div className="poster-skeleton__line" />
                <div className="poster-skeleton__line poster-skeleton__line--short" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="directory-empty">
            <h2>We couldn’t load the catalogue.</h2>
            <p>Check that the LoreZone API and database are available, then refresh.</p>
            <button type="button" className="secondary-button" onClick={() => window.location.reload()}>
              Try again <ArrowUpRight size={14} />
            </button>
          </div>
        ) : titles.length === 0 ? (
          <div className="directory-empty">
            <h2>No titles in this section yet.</h2>
            <p>Try another media type or explore the live anime and manga catalogue.</p>
          </div>
        ) : (
          <div className="title-library-grid">
            {titles.map(title => <TitleCard key={title.id} title={title} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
