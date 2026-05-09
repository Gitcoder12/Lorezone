'use client'

import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import TitleCard from '../../components/TitleCard'
import { Title, MediaType } from '../types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const MEDIA_TYPES: MediaType[] = ['anime', 'manga', 'movie', 'ova', 'ona', 'special', 'manhwa', 'novel', 'spin_off']

export default function TitlesPage() {
  const [titles, setTitles] = useState<Title[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    setLoading(true)
    const url = filter === 'all'
      ? `${API}/api/titles?limit=60`
      : `${API}/api/titles?media_type=${filter}&limit=60`
    fetch(url)
      .then(r => r.json())
      .then(d => { setTitles(d.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [filter])

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="font-syne text-4xl font-bold mb-2">Browse Titles</h1>
        <p className="text-white/40 mb-6 text-sm">All anime, manga, movies, and spinoffs in the database</p>

        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-white/5 mb-6">
          {['all', ...MEDIA_TYPES].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                filter === t
                  ? 'border-[#e24b4a] text-white'
                  : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              {t === 'all' ? 'All' : t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : titles.length === 0 ? (
          <p className="text-white/30 text-sm py-8 text-center">No titles found</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {titles.map(t => <TitleCard key={t.id} title={t} />)}
          </div>
        )}
      </div>
    </div>
  )
}
