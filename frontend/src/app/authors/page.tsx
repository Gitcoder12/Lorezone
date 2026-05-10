'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Notable creators to feature by default (MAL person IDs)
const FEATURED_CREATORS = [
  { mal_id: 1880, name: 'Eiichiro Oda', known_for: 'One Piece', role: 'Manga Author' },
  { mal_id: 1881, name: 'Masashi Kishimoto', known_for: 'Naruto', role: 'Manga Author' },
  { mal_id: 10563, name: 'Tite Kubo', known_for: 'Bleach', role: 'Manga Author' },
  { mal_id: 1870, name: 'Akira Toriyama', known_for: 'Dragon Ball', role: 'Manga Author' },
  { mal_id: 7277, name: 'Hiromu Arakawa', known_for: 'Fullmetal Alchemist', role: 'Manga Author' },
  { mal_id: 11397, name: 'Koyoharu Gotouge', known_for: 'Demon Slayer', role: 'Manga Author' },
  { mal_id: 33195, name: 'Kōhei Horikoshi', known_for: 'My Hero Academia', role: 'Manga Author' },
  { mal_id: 7278, name: 'Yoshihiro Togashi', known_for: 'Hunter x Hunter', role: 'Manga Author' },
  { mal_id: 185, name: 'Hayao Miyazaki', known_for: 'Studio Ghibli films', role: 'Director' },
  { mal_id: 80, name: 'Kentaro Miura', known_for: 'Berserk', role: 'Manga Author' },
  { mal_id: 7276, name: 'Rumiko Takahashi', known_for: 'Inuyasha, Ranma ½', role: 'Manga Author' },
  { mal_id: 6468, name: 'Naoki Urasawa', known_for: 'Monster, 20th Century Boys', role: 'Manga Author' },
]

interface Person {
  mal_id: number
  name: string
  name_kanji?: string
  images?: { jpg: { image_url: string } }
  about?: string
  birthday?: string
  website_url?: string
}

export default function AuthorsPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Person[]>([])
  const [selected, setSelected] = useState<(Person & { anime_works?: unknown[] }) | null>(null)
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/live/people?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.data || [])
    } catch { }
    setLoading(false)
  }

  const openPerson = async (id: number) => {
    setDetailLoading(true)
    setSelected(null)
    try {
      const res = await fetch(`${API}/api/live/people/${id}`)
      const data = await res.json()
      setSelected(data)
    } catch { }
    setDetailLoading(false)
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="py-14 px-4 text-center bg-gradient-to-b from-amber-900/15 to-transparent">
        <h1 className="font-syne text-4xl md:text-5xl font-bold mb-3">✍️ Creators & Authors</h1>
        <p className="text-white/40 max-w-xl mx-auto text-sm">
          The minds behind your favourite universes. Search any manga author, anime director, or character designer.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Search */}
        <form onSubmit={search} className="flex gap-3 mb-10 max-w-xl mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search creator e.g. Eiichiro Oda..."
              className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 pl-11 text-sm focus:outline-none focus:border-amber-500/50 placeholder-white/25"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          </div>
          <button type="submit" className="bg-amber-600 hover:bg-amber-500 transition rounded-full px-6 py-3 text-sm font-medium">
            Search
          </button>
        </form>

        {/* Search results */}
        {loading && <p className="text-center text-white/40 text-sm mb-8">Searching...</p>}
        {results.length > 0 && (
          <div className="mb-12">
            <h2 className="font-syne text-lg font-bold mb-4 text-white/70">Search Results</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map(p => (
                <button
                  key={p.mal_id}
                  onClick={() => openPerson(p.mal_id)}
                  className="group bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden hover:border-amber-500/30 hover:-translate-y-1 transition-all duration-200 text-left"
                >
                  <div className="relative aspect-[3/4] bg-[#222]">
                    {p.images?.jpg?.image_url ? (
                      <Image src={p.images.jpg.image_url} alt={p.name} fill className="object-cover object-top" sizes="200px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-3xl">👤</div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold line-clamp-1">{p.name}</p>
                    {p.name_kanji && <p className="text-[10px] text-white/30 mt-0.5">{p.name_kanji}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Detail panel */}
        {(detailLoading || selected) && (
          <div className="mb-12 bg-[#1a1a1a] border border-white/5 rounded-2xl p-6">
            {detailLoading ? (
              <div className="flex gap-5 animate-pulse">
                <div className="w-28 aspect-[3/4] bg-white/5 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-white/5 rounded w-48" />
                  <div className="h-4 bg-white/5 rounded w-32" />
                  <div className="h-20 bg-white/5 rounded" />
                </div>
              </div>
            ) : selected && (
              <div className="flex gap-5 flex-wrap md:flex-nowrap">
                <div className="relative w-28 aspect-[3/4] rounded-xl overflow-hidden bg-[#222] shrink-0">
                  {selected.images?.jpg?.image_url ? (
                    <Image src={selected.images.jpg.image_url} alt={selected.name} fill className="object-cover object-top" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-3xl">👤</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-syne text-2xl font-bold mb-1">{selected.name}</h3>
                  {selected.name_kanji && <p className="text-white/40 text-sm mb-2">{selected.name_kanji}</p>}
                  {selected.birthday && <p className="text-xs text-white/30 mb-3">Born: {selected.birthday?.slice(0, 10)}</p>}
                  {selected.about && (
                    <p className="text-sm text-white/50 leading-relaxed line-clamp-5">{selected.about}</p>
                  )}
                  {selected.website_url && (
                    <a href={selected.website_url} target="_blank" rel="noopener noreferrer"
                      className="inline-block mt-3 text-xs text-amber-400 hover:underline">
                      Official Website →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Featured creators */}
        <h2 className="font-syne text-2xl font-bold mb-6">Featured Creators</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {FEATURED_CREATORS.map(c => (
            <button
              key={c.mal_id}
              onClick={() => openPerson(c.mal_id)}
              className="group bg-[#1a1a1a] border border-white/5 rounded-xl p-4 text-left hover:border-amber-500/30 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-full bg-amber-600/20 flex items-center justify-center text-xl mb-3 group-hover:bg-amber-600/30 transition">
                ✍️
              </div>
              <p className="font-semibold text-sm mb-0.5">{c.name}</p>
              <p className="text-xs text-[#e24b4a]">{c.known_for}</p>
              <p className="text-xs text-white/30 mt-0.5">{c.role}</p>
            </button>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
