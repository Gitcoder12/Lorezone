'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import MediaBadge from '../../components/MediaBadge'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

interface AnimeEntry {
  mal_id: number
  title: string
  title_english: string
  images: { jpg: { image_url: string } }
  type: string
  episodes: number | null
  score: number | null
  broadcast: { day: string; time: string; timezone: string }
  studios: { name: string }[]
}

export default function SchedulePage() {
  const [day, setDay] = useState(() => DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1])
  const [anime, setAnime] = useState<AnimeEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`${API}/api/live/schedule?day=${day}`)
      .then(r => r.json())
      .then(d => { setAnime(d.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [day])

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="py-14 px-4 text-center bg-gradient-to-b from-blue-900/15 to-transparent">
        <h1 className="font-syne text-4xl md:text-5xl font-bold mb-3">📅 Airing Schedule</h1>
        <p className="text-white/40 text-sm max-w-lg mx-auto">What's airing this week — by day of the week.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Day tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-white/5 mb-8">
          {DAYS.map(d => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`px-5 py-3 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${
                day === d ? 'border-[#e24b4a] text-white' : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : anime.length === 0 ? (
          <p className="text-center text-white/30 py-16">No anime scheduled for {day}</p>
        ) : (
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
                      sizes="200px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-3xl">🎬</div>
                  )}
                  {a.broadcast?.time && (
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur text-[10px] px-1.5 py-0.5 rounded text-white/70">
                      {a.broadcast.time} JST
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium line-clamp-2 mb-1.5 leading-snug">{a.title_english || a.title}</p>
                  <div className="flex items-center gap-1.5">
                    <MediaBadge type="anime" small />
                    {a.score && <span className="text-[10px] text-white/30">★ {a.score}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
