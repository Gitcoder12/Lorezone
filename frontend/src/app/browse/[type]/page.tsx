'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Filter, ChevronDown } from 'lucide-react'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import MediaBadge from '../../../components/MediaBadge'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const FILTERS: Record<string, { label: string; value: string }[]> = {
  anime: [
    { label: 'By Popularity', value: 'bypopularity' },
    { label: 'Airing Now', value: 'airing' },
    { label: 'Top Rated', value: 'byrank' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Favourite', value: 'favorite' },
  ],
  manga: [
    { label: 'By Popularity', value: 'bypopularity' },
    { label: 'Publishing', value: 'publishing' },
    { label: 'Top Rated', value: 'byrank' },
    { label: 'Favourite', value: 'favorite' },
  ],
}

interface MediaItem {
  mal_id: number
  title: string
  title_english: string
  images: { jpg: { image_url: string; large_image_url: string } }
  score: number
  type: string
  episodes?: number
  chapters?: number
  genres: { name: string }[]
  synopsis: string
  status: string
  rank: number
  popularity: number
}

export default function BrowsePage() {
  const { type } = useParams()
  const mediaType = (type as string) === 'manga' ? 'manga' : 'anime'
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('bypopularity')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const router = useRouter()

  const fetch_ = useCallback(async (f: string, p: number, append = false) => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/live/top/${mediaType}?filter=${f}&page=${p}&limit=24`)
      const data = await res.json()
      const newItems = data.data || []
      setItems(prev => append ? [...prev, ...newItems] : newItems)
      setHasMore(data.pagination?.has_next_page || false)
    } catch { }
    setLoading(false)
  }, [mediaType])

  useEffect(() => { setPage(1); setItems([]); fetch_(filter, 1) }, [filter, fetch_])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetch_(filter, next, true)
  }

  const filters = FILTERS[mediaType] || FILTERS.anime
  const isAnime = mediaType === 'anime'

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-b from-[#1a1a1a] to-transparent py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="text-white/30 hover:text-white text-sm transition">Home</Link>
            <span className="text-white/20">/</span>
            <span className="text-sm capitalize">{mediaType}</span>
          </div>
          <h1 className="font-syne text-4xl font-bold mb-6 capitalize">
            {isAnime ? '🎬' : '📖'} Browse {mediaType}
          </h1>

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {filters.map(f => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filter === f.value
                    ? 'bg-[#e24b4a] text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10'
                }`}>
                {f.label}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              {(['grid', 'list'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-2 rounded-lg text-sm transition ${view === v ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}>
                  {v === 'grid' ? '⊞' : '≡'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Grid view */}
        {view === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loading && items.length === 0
              ? Array.from({ length: 24 }).map((_, i) => <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />)
              : items.map(item => (
                  <Link key={item.mal_id} href={`/live/${mediaType}/${item.mal_id}`}
                    className="group bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden hover:border-white/15 hover:-translate-y-1 transition-all duration-200 block">
                    <div className="relative aspect-[2/3] bg-[#222]">
                      {item.images?.jpg?.image_url
                        ? <Image src={item.images.jpg.image_url} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="200px" />
                        : <div className="absolute inset-0 flex items-center justify-center text-3xl">{isAnime ? '🎬' : '📖'}</div>
                      }
                      {item.score && (
                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur text-[10px] px-1.5 py-0.5 rounded text-yellow-400 font-bold">
                          ★ {item.score}
                        </div>
                      )}
                      {item.rank && (
                        <div className="absolute top-2 left-2 bg-[#e24b4a]/80 text-[10px] px-1.5 py-0.5 rounded font-bold">
                          #{item.rank}
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium line-clamp-2 mb-1.5 leading-snug">{item.title_english || item.title}</p>
                      <MediaBadge type={isAnime ? (item.type?.toLowerCase() === 'tv' ? 'anime' : (item.type?.toLowerCase() || 'anime')) : (item.type?.toLowerCase() || 'manga')} small />
                    </div>
                  </Link>
                ))
            }
          </div>
        )}

        {/* List view */}
        {view === 'list' && (
          <div className="space-y-2">
            {loading && items.length === 0
              ? Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)
              : items.map((item, idx) => (
                  <Link key={item.mal_id} href={`/live/${mediaType}/${item.mal_id}`}
                    className="flex items-center gap-4 bg-[#1a1a1a] border border-white/5 rounded-xl p-3 hover:border-white/15 transition group">
                    <span className="text-white/20 text-sm font-bold w-8 text-center shrink-0">{idx + 1}</span>
                    <div className="relative w-12 aspect-[2/3] rounded-lg overflow-hidden bg-[#222] shrink-0">
                      {item.images?.jpg?.image_url
                        ? <Image src={item.images.jpg.image_url} alt="" fill className="object-cover" sizes="50px" />
                        : <div className="absolute inset-0 flex items-center justify-center text-lg">{isAnime ? '🎬' : '📖'}</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-[#e24b4a] transition">{item.title_english || item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MediaBadge type={isAnime ? (item.type?.toLowerCase() === 'tv' ? 'anime' : (item.type?.toLowerCase() || 'anime')) : 'manga'} small />
                        {item.genres?.slice(0, 2).map((g: any) => (
                          <span key={g.name} className="text-[10px] text-white/30">{g.name}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {item.score && <span className="text-yellow-400 text-sm font-bold">★ {item.score}</span>}
                      {item.episodes && <span className="text-[10px] text-white/30">{item.episodes} eps</span>}
                      {item.chapters && <span className="text-[10px] text-white/30">{item.chapters} ch</span>}
                    </div>
                  </Link>
                ))
            }
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <div className="flex justify-center mt-10">
            <button onClick={loadMore}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-8 py-3 text-sm font-medium transition">
              Load More
            </button>
          </div>
        )}
        {loading && items.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="w-6 h-6 border-2 border-white/10 border-t-[#e24b4a] rounded-full animate-spin" />
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
