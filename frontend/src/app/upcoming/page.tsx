'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import MediaBadge from '../../components/MediaBadge'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface AnimeEntry {
  mal_id: number
  title: string
  title_english: string
  images: { jpg: { image_url: string; large_image_url: string } }
  aired: { from: string; string: string }
  type: string
  episodes: number | null
  score: number | null
  synopsis: string
  studios: { name: string }[]
  genres: { name: string }[]
  status: string
  season: string
  year: number
}

export default function UpcomingPage() {
  const [anime, setAnime] = useState<AnimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchUpcoming = async (p: number, append = false) => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/live/upcoming?page=${p}`)
      const data = await res.json()
      const items = data.data || []
      setAnime(prev => append ? [...prev, ...items] : items)
      setHasMore(data.pagination?.has_next_page || false)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => { fetchUpcoming(1) }, [])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchUpcoming(next, true)
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-900/20 to-transparent py-16 px-4 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#7c3aed20_0%,_transparent_70%)] pointer-events-none" />
        <h1 className="font-syne text-4xl md:text-5xl font-bold mb-3 relative z-10">
          🚀 Future Releases
        </h1>
        <p className="text-white/40 text-base max-w-xl mx-auto relative z-10">
          Upcoming anime announced for future seasons — bookmark what you're hyped for.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {loading && anime.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {anime.map(a => (
                <div
                  key={a.mal_id}
                  className="group bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden hover:border-white/15 hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="relative aspect-[2/3] bg-[#222]">
                    {a.images?.jpg?.image_url ? (
                      <Image
                        src={a.images.jpg.image_url}
                        alt={a.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-3xl">🎬</div>
                    )}
                    {/* Season badge */}
                    {a.season && (
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur text-xs px-2 py-0.5 rounded-full capitalize text-white/80">
                        {a.season} {a.year}
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium line-clamp-2 mb-1.5 leading-snug">{a.title_english || a.title}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <MediaBadge type={a.type?.toLowerCase() === 'tv' ? 'anime' : (a.type?.toLowerCase() || 'anime')} small />
                      {a.episodes && <span className="text-[10px] text-white/30">{a.episodes} ep</span>}
                    </div>
                    {a.studios?.[0] && (
                      <p className="text-[10px] text-white/25 mt-1 truncate">{a.studios[0].name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-8 py-3 text-sm font-medium transition disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
