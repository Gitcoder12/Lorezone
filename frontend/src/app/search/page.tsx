'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search } from 'lucide-react'
import Navbar from '../../components/Navbar'
import MediaBadge from '../../components/MediaBadge'
import { SearchResult } from '../types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get('q') || ''
  const [query, setQuery] = useState(q)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    fetch(`${API}/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => { setResults(d.results || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [q])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const titles = results.filter(r => r.result_type === 'title')
  const franchises = results.filter(r => r.result_type === 'franchise')

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="font-syne text-3xl font-bold mb-6">Search</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-xl">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search franchises, anime, manga..."
              className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 pl-12 focus:outline-none focus:border-[#e24b4a]/50 placeholder-white/25"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          </div>
        </form>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && q && results.length === 0 && (
          <p className="text-white/30 text-sm">No results for "{q}"</p>
        )}

        {franchises.length > 0 && (
          <div className="mb-8">
            <h2 className="font-syne text-lg font-bold mb-3 text-white/70">Franchises</h2>
            <div className="space-y-2">
              {franchises.map(f => (
                <Link
                  key={f.id}
                  href={`/franchise/${f.slug}`}
                  className="flex items-center gap-4 bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 hover:border-white/15 transition group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#e24b4a]/20 flex items-center justify-center font-syne font-bold text-[#e24b4a] shrink-0">
                    {f.title.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-[#e24b4a] transition">{f.title}</p>
                    <p className="text-xs text-white/30">Franchise</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {titles.length > 0 && (
          <div>
            <h2 className="font-syne text-lg font-bold mb-3 text-white/70">
              Titles <span className="text-white/25 text-sm font-normal">({titles.length})</span>
            </h2>
            <div className="space-y-2">
              {titles.map(t => (
                <Link
                  key={t.id}
                  href={`/title/${t.slug}`}
                  className="flex items-center gap-4 bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 hover:border-white/15 transition group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-sm group-hover:text-[#e24b4a] transition truncate">{t.title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {t.media_type && <MediaBadge type={t.media_type} small />}
                        {t.franchise_name && <span className="text-xs text-white/30">{t.franchise_name}</span>}
                      </div>
                    </div>
                  </div>
                  {t.avg_rating && (
                    <span className="text-xs text-white/30 shrink-0">★ {t.avg_rating}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen"><div className="max-w-5xl mx-auto px-4 py-10"><div className="h-8 bg-white/5 rounded w-48 animate-pulse" /></div></div>}>
      <SearchContent />
    </Suspense>
  )
}
