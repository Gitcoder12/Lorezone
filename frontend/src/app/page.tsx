'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, TrendingUp, Clock, BookOpen } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MediaBadge from '../components/MediaBadge'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface AnimeEntry {
  mal_id: number
  title: string
  title_english: string
  images: { jpg: { image_url: string } }
  score: number
  type: string
  episodes: number | null
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [topAnime, setTopAnime] = useState<AnimeEntry[]>([])
  const [topManga, setTopManga] = useState<AnimeEntry[]>([])
  const [seasonNow, setSeasonNow] = useState<AnimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/live/top/anime?filter=bypopularity`).then(r => r.json()),
      fetch(`${API}/api/live/top/manga?filter=bypopularity`).then(r => r.json()),
      fetch(`${API}/api/live/season/now`).then(r => r.json()),
    ]).then(([ta, tm, sn]) => {
      setTopAnime(ta.data?.slice(0, 12) || [])
      setTopManga(tm.data?.slice(0, 12) || [])
      setSeasonNow(sn.data?.slice(0, 12) || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const MediaCard = ({ item, kind }: { item: AnimeEntry; kind: string }) => (
    <Link
      href={`/live/${kind}/${item.mal_id}`}
      className="group bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden hover:border-white/15 hover:-translate-y-1 transition-all duration-200 block"
    >
      <div className="relative aspect-[2/3] bg-[#222]">
        {item.images?.jpg?.image_url ? (
          <Image src={item.images.jpg.image_url} alt={item.title} fill
            className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="200px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl">{kind === 'anime' ? '🎬' : '📖'}</div>
        )}
        {item.score && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur text-[10px] px-1.5 py-0.5 rounded text-yellow-400 font-bold">
            ★ {item.score}
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-medium line-clamp-2 mb-1.5 leading-snug">{item.title_english || item.title}</p>
        <MediaBadge type={kind === 'anime' ? (item.type?.toLowerCase() === 'tv' ? 'anime' : (item.type?.toLowerCase() || 'anime')) : 'manga'} small />
      </div>
    </Link>
  )

  const Section = ({ title, icon, items, kind, href }: {
    title: string; icon: React.ReactNode; items: AnimeEntry[]; kind: string; href: string
  }) => (
    <div className="mb-14">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-syne text-xl font-bold flex items-center gap-2">{icon} {title}</h2>
        <Link href={href} className="text-sm text-[#e24b4a] hover:underline">View all →</Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {items.map(item => <MediaCard key={item.mal_id} item={item} kind={kind} />)}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden flex flex-col items-center justify-center text-center py-24 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_#e24b4a18_0%,_transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,_#7c3aed10_0%,_transparent_50%)] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/50 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live data from MyAnimeList · {new Date().getFullYear()}
          </div>

          <h1 className="font-syne text-5xl md:text-7xl font-bold mb-5 leading-tight">
            Every Story Universe.<br />
            <span className="text-[#e24b4a]">Finally Connected.</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto mb-10">
            Anime, manga, movies, OVAs, spinoffs — all grouped under one franchise. Discover what's connected.
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto">
            <div className="relative">
              <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search Bleach, Naruto, One Piece..."
                className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 pl-14 text-base focus:outline-none focus:border-[#e24b4a]/50 placeholder-white/20"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#e24b4a] hover:bg-[#c93e3d] transition rounded-full px-5 py-2.5 text-sm font-medium">
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {[
              { href: '/schedule', icon: '📅', label: 'Airing Schedule' },
              { href: '/upcoming', icon: '🚀', label: 'Future Releases' },
              { href: '/authors', icon: '✍️', label: 'Authors' },
              { href: '/browse/anime', icon: '🎬', label: 'Top Anime' },
              { href: '/browse/manga', icon: '📖', label: 'Top Manga' },
            ].map(({ href, icon, label }) => (
              <Link key={href} href={href}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/60 hover:text-white transition">
                {icon} {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-10">
        <Section title="Airing This Season" icon={<Clock className="w-5 h-5 text-green-400" />} items={seasonNow} kind="anime" href="/schedule" />
        <Section title="Top Anime" icon={<TrendingUp className="w-5 h-5 text-[#e24b4a]" />} items={topAnime} kind="anime" href="/browse/anime" />
        <Section title="Top Manga" icon={<BookOpen className="w-5 h-5 text-orange-400" />} items={topManga} kind="manga" href="/browse/manga" />
      </div>

      <div className="border-t border-b border-white/5 py-14 px-4 my-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji: '🔗', title: 'Connected Universes', desc: 'Every manga, anime, movie, OVA and spinoff linked together under one franchise page.', href: '/franchises' },
            { emoji: '📅', title: 'Airing Schedule', desc: "See what's airing today, this week, and every day — with broadcast times.", href: '/schedule' },
            { emoji: '🚀', title: 'Future Releases', desc: 'Track upcoming anime seasons and never miss an announcement again.', href: '/upcoming' },
          ].map(({ emoji, title, desc, href }) => (
            <Link key={title} href={href}
              className="group bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 hover:border-white/15 hover:-translate-y-1 transition-all duration-200">
              <div className="text-3xl mb-3">{emoji}</div>
              <h3 className="font-syne font-bold text-base mb-2 group-hover:text-[#e24b4a] transition">{title}</h3>
              <p className="text-sm text-white/40">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
