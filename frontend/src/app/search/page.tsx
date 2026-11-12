'use client'

import { FormEvent, Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUpRight, Search, Sparkles } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import MediaBadge from '../../components/MediaBadge'
import { SearchResult } from '../types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryParam = searchParams.get('q') || ''
  const [query, setQuery] = useState(queryParam)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setQuery(queryParam)
    if (queryParam.trim().length < 2) {
      setResults([])
      setLoading(false)
      setError(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(false)
    fetch(\`\${API}/api/search?q=\${encodeURIComponent(queryParam)}\`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Search is unavailable')
        return response.json()
      })
      .then(data => {
        if (!controller.signal.aborted) setResults(data.results || [])
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [queryParam])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed.length >= 2) router.push(\`/search?q=\${encodeURIComponent(trimmed)}\`)
  }

  const franchises = results.filter(result => result.result_type === 'franchise')
  const titles = results.filter(result => result.result_type === 'title')

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-shell">
        <section className="page-intro search-intro">
          <p className="eyebrow">FIND YOUR NEXT OBSESSION</p>
          <h1>Search the storyverse.</h1>
          <p>Look up a title or jump straight into a connected universe.</p>
          <form className="search-page-form" onSubmit={submit} role="search">
            <Search size={19} />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Try Naruto, Bleach, One Piece..."
              aria-label="Search titles and franchises"
            />
            <button type="submit">Search <ArrowUpRight size={15} /></button>
          </form>
        </section>

        {queryParam.length < 2 ? (
          <section className="search-empty">
            <Sparkles size={25} />
            <h2>Every story starts somewhere.</h2>
            <p>Search the LoreZone database for franchises and connected titles.</p>
            <div className="search-shortcuts">
              <Link href="/franchises">Browse universes</Link>
              <Link href="/browse/anime">Explore anime</Link>
              <Link href="/browse/manga">Explore manga</Link>
            </div>
          </section>
        ) : null}

        {loading ? (
          <div className="search-loading">
            {Array.from({ length: 5 }).map((_, index) => <div key={index} />)}
          </div>
        ) : null}

        {error && !loading ? (
          <div className="directory-empty">
            <h2>Search is temporarily unavailable.</h2>
            <p>Check that the LoreZone API and database are running, then try again.</p>
          </div>
        ) : null}

        {!loading && !error && queryParam.length >= 2 && results.length === 0 ? (
          <div className="directory-empty">
            <h2>No matches for “{queryParam}”.</h2>
            <p>Try a shorter name, an alternate spelling or a franchise title.</p>
          </div>
        ) : null}

        {!loading && franchises.length > 0 ? (
          <section className="search-result-section">
            <div className="section-heading">
              <div><p className="eyebrow">CONNECTED WORLDS</p><h2>Universes</h2></div>
              <span className="catalogue-total">{franchises.length} found</span>
            </div>
            <div className="search-franchise-grid">
              {franchises.map(franchise => (
                <Link href={\`/franchise/\${franchise.slug}\`} key={franchise.id} className="search-franchise-card">
                  <span className="search-franchise-card__symbol">{franchise.title.slice(0, 1)}</span>
                  <span><strong>{franchise.title}</strong><small>Connected universe</small></span>
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {!loading && titles.length > 0 ? (
          <section className="search-result-section">
            <div className="section-heading">
              <div><p className="eyebrow">THE CATALOGUE</p><h2>Titles</h2></div>
              <span className="catalogue-total">{titles.length} found</span>
            </div>
            <div className="search-title-list">
              {titles.map(title => (
                <Link href={\`/title/\${title.slug}\`} key={title.id} className="search-title-card">
                  <span className="search-title-card__symbol">{title.title.slice(0, 1)}</span>
                  <span className="search-title-card__copy">
                    <strong>{title.title}</strong>
                    <span>
                      {title.media_type ? <MediaBadge type={title.media_type} small /> : null}
                      {title.franchise_name ? <small>{title.franchise_name}</small> : null}
                    </span>
                  </span>
                  {title.avg_rating ? <span className="search-title-card__rating">★ {Number(title.avg_rating).toFixed(1)}</span> : null}
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen"><Navbar /><main className="page-shell"><div className="search-loading"><div /></div></main><Footer /></div>}>
      <SearchContent />
    </Suspense>
  )
}
