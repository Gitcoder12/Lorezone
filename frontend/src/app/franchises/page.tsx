'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Search, Sparkles } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { Franchise } from '../types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function FranchisesPage() {
  const [franchises, setFranchises] = useState<Franchise[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${API}/api/franchises`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Could not load universes')
        return response.json()
      })
      .then(data => {
        if (!controller.signal.aborted) setFranchises(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return [...franchises]
      .filter(franchise =>
        !normalized ||
        franchise.name.toLowerCase().includes(normalized) ||
        (franchise.description || '').toLowerCase().includes(normalized)
      )
      .sort((a, b) => (Number(b.title_count) || 0) - (Number(a.title_count) || 0))
  }, [franchises, query])

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-shell">
        <section className="page-intro">
          <p className="eyebrow">THE UNIVERSE DIRECTORY</p>
          <h1>Worlds worth getting lost in.</h1>
          <p>
            Follow a story across its original series, adaptations, sequels,
            films and spin-offs. One universe, all its connected chapters.
          </p>
          <div className="directory-toolbar">
            <div className="directory-count">
              <Sparkles size={15} />
              <span>{loading ? 'Loading worlds' : `${franchises.length} connected universes`}</span>
            </div>
            <label className="directory-search">
              <Search size={16} />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Find a universe..."
                aria-label="Filter universes"
              />
            </label>
          </div>
        </section>

        {loading ? (
          <div className="franchise-grid">
            {Array.from({ length: 9 }).map((_, index) => (
              <div className="franchise-skeleton" key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="directory-empty">
            <h2>We couldn’t load the universe directory.</h2>
            <p>Check that the LoreZone API is running, then refresh this page.</p>
            <button type="button" className="secondary-button" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="directory-empty">
            <h2>{query ? 'No matching universes.' : 'The directory is waiting.'}</h2>
            <p>{query ? 'Try another title or clear your search.' : 'Connected franchises will appear here when they are added to LoreZone.'}</p>
          </div>
        ) : (
          <div className="franchise-grid">
            {visible.map((franchise, index) => (
              <Link
                key={franchise.id}
                href={`/franchise/${franchise.slug}`}
                className="franchise-card"
              >
                {franchise.cover_image ? (
                  <div className="franchise-card__art">
                    <Image
                      src={franchise.cover_image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                    />
                  </div>
                ) : null}
                <div className="franchise-card__shade" />
                <span className="franchise-card__number">{String(index + 1).padStart(2, '0')}</span>
                <span className="franchise-card__arrow"><ArrowUpRight size={16} /></span>
                <div className="franchise-card__content">
                  <small>CONNECTED UNIVERSE</small>
                  <h3>{franchise.name}</h3>
                  <p>{franchise.description || 'Explore the stories and titles in this universe.'}</p>
                  <div className="franchise-stat-row">
                    <span>{franchise.title_count || 0} titles</span>
                    {franchise.avg_rating ? <span>★ {Number(franchise.avg_rating).toFixed(1)} avg.</span> : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
