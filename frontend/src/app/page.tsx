'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, TrendingUp, Film, BookOpen, Tv, Layers } from 'lucide-react'
import Navbar from '../components/Navbar'
import { Franchise } from './types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function HomePage() {
  const [franchises, setFranchises] = useState<Franchise[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch(`${API}/api/franchises`)
      .then(r => r.json())
      .then(d => { setFranchises(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center text-center py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e24b4a]/5 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#e24b4a15_0%,_transparent_60%)] pointer-events-none" />

        <h1 className="font-syne text-5xl md:text-7xl font-bold mb-4 relative z-10">
          Every Story Universe.<br />
          <span className="text-[#e24b4a]">Finally Connected.</span>
        </h1>
        <p className="text-white/50 text-lg md:text-xl max-w-2xl mb-10 relative z-10">
          Anime, manga, movies, spinoffs, OVAs — all grouped, all linked, one place.
        </p>

        <form onSubmit={handleSearch} className="relative z-10 w-full max-w-xl">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for Bleach, Naruto, Attack on Titan..."
              className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 pl-14 text-base focus:outline-none focus:border-[#e24b4a]/50 focus:ring-2 focus:ring-[#e24b4a]/10 placeholder-white/25"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-white/40 relative z-10">
          {[
            { icon: <Tv className="w-4 h-4" />, label: 'Anime' },
            { icon: <BookOpen className="w-4 h-4" />, label: 'Manga & Novels' },
            { icon: <Film className="w-4 h-4" />, label: 'Movies' },
            { icon: <Layers className="w-4 h-4" />, label: 'Spinoffs' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-white/40">
              <span className="text-[#e24b4a]/70">{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Franchises */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-syne text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#e24b4a]" />
            Featured Universes
          </h2>
          <Link href="/franchises" className="text-sm text-[#e24b4a] hover:underline">View all →</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {franchises.map(f => (
              <Link
                key={f.id}
                href={`/franchise/${f.slug}`}
                className="group bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden hover:border-white/15 hover:-translate-y-1 transition-all duration-200"
              >
                <div className="h-36 bg-gradient-to-br from-[#e24b4a]/20 to-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
                  <span className="font-syne text-5xl font-bold text-white/10 group-hover:text-white/15 transition-colors">
                    {f.name.charAt(0)}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-syne text-lg font-bold mb-1">{f.name}</h3>
                  <p className="text-sm text-white/40 line-clamp-2 mb-3">
                    {f.description || 'Explore this connected universe'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-white/30">
                    <span>{f.title_count || 0} titles</span>
                    {f.avg_rating && <span>★ {Number(f.avg_rating).toFixed(1)}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Feature callouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16">
          {[
            { emoji: '🔗', title: 'Connected Universes', desc: 'Every manga, anime, movie, and spinoff linked together under one franchise.' },
            { emoji: '⏱️', title: 'Timeline Explorer', desc: 'Read or watch in chronological order or release order — your choice.' },
            { emoji: '🌀', title: 'Spinoff Discovery', desc: 'Find every OVA, side story, alternate timeline, and film in one tab.' },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">{emoji}</div>
              <h3 className="font-syne font-bold text-base mb-2">{title}</h3>
              <p className="text-sm text-white/40">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
