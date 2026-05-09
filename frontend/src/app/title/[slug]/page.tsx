'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Navbar from '../../../components/Navbar'
import MediaBadge from '../../../components/MediaBadge'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Connection {
  id: number
  connection_type: string
  description: string
  weight: number
  target_title?: string
  target_slug?: string
  target_media_type?: string
  target_cover?: string
  source_title?: string
  source_slug?: string
  source_media_type?: string
  source_cover?: string
}

interface Review {
  id: number
  username: string
  rating: number
  content: string
  spoiler: boolean
  created_at: string
}

interface FullTitle {
  id: number
  franchise_id: number
  franchise_name: string
  franchise_slug: string
  title: string
  slug: string
  media_type: string
  release_date: string
  studio: string
  author: string
  artist: string
  publisher: string
  episode_count: number | null
  chapter_count: number | null
  volume_count: number | null
  runtime_minutes: number | null
  synopsis: string
  cover_image: string
  trailer_url: string
  avg_rating: number
  language: string
  is_completed: boolean
  tags: { id: number; name: string }[]
  connections: { outgoing: Connection[]; incoming: Connection[] }
  reviews: Review[]
}

export default function TitlePage() {
  const { slug } = useParams()
  const [title, setTitle] = useState<FullTitle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/titles/${slug}`)
      .then(r => r.json())
      .then(d => { setTitle(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-6 bg-white/5 rounded w-32 mb-6" />
          <div className="flex gap-6">
            <div className="w-40 aspect-[2/3] bg-white/5 rounded-xl shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-white/5 rounded w-3/4" />
              <div className="h-4 bg-white/5 rounded w-1/2" />
              <div className="h-24 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!title) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/40 mb-4">Title not found</p>
            <Link href="/" className="text-[#e24b4a] hover:underline">Go home</Link>
          </div>
        </div>
      </div>
    )
  }

  const allConnections = [
    ...(title.connections?.outgoing || []).map(c => ({
      ...c, name: c.target_title, slug: c.target_slug, type: c.target_media_type, cover: c.target_cover,
    })),
    ...(title.connections?.incoming || []).map(c => ({
      ...c, name: c.source_title, slug: c.source_slug, type: c.source_media_type, cover: c.source_cover,
    })),
  ]

  const groupedConnections = allConnections.reduce((acc, c) => {
    const key = c.connection_type
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {} as Record<string, typeof allConnections>)

  const meta: [string, string | number][] = [
    ['Studio', title.studio], ['Author', title.author], ['Artist', title.artist],
    ['Publisher', title.publisher], ['Episodes', title.episode_count!],
    ['Chapters', title.chapter_count!], ['Volumes', title.volume_count!],
    ['Runtime', title.runtime_minutes ? `${title.runtime_minutes} min` : ''],
    ['Language', title.language], ['Status', title.is_completed ? 'Completed' : 'Ongoing'],
    ['Released', title.release_date ? title.release_date.slice(0, 10) : ''],
  ].filter(([, v]) => v) as [string, string | number][]

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-white/30 mb-6">
          {title.franchise_name && (
            <>
              <Link href={`/franchise/${title.franchise_slug}`} className="hover:text-white transition">
                {title.franchise_name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-white/60">{title.title}</span>
        </div>

        <div className="flex gap-6 mb-8">
          <div className="relative w-36 md:w-44 aspect-[2/3] rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/5 shrink-0">
            {title.cover_image ? (
              <Image src={title.cover_image} alt={title.title} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-4xl">
                {['anime', 'movie', 'ova'].includes(title.media_type) ? '🎬' : '📖'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <MediaBadge type={title.media_type} />
              {title.is_completed && (
                <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded">Completed</span>
              )}
            </div>
            <h1 className="font-syne text-2xl md:text-3xl font-bold mb-1">{title.title}</h1>
            {title.franchise_name && <p className="text-sm text-white/40 mb-3">{title.franchise_name}</p>}
            {title.avg_rating && (
              <div className="flex items-center gap-1 mb-3">
                <span className="text-yellow-400 text-lg">★</span>
                <span className="font-bold text-xl">{title.avg_rating}</span>
                <span className="text-white/30 text-sm">/ 10</span>
              </div>
            )}
            {title.tags && title.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {title.tags.map(tag => (
                  <span key={tag.id} className="text-xs px-2 py-0.5 bg-white/5 rounded text-white/40">{tag.name}</span>
                ))}
              </div>
            )}
            {title.trailer_url && (
              <a href={title.trailer_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#e24b4a] hover:underline">
                <ExternalLink className="w-3.5 h-3.5" /> Watch Trailer
              </a>
            )}
          </div>
        </div>

        {title.synopsis && (
          <div className="mb-8">
            <h2 className="font-syne text-lg font-bold mb-3">Synopsis</h2>
            <p className="text-white/60 text-sm leading-relaxed">{title.synopsis}</p>
          </div>
        )}

        {meta.length > 0 && (
          <div className="mb-8 bg-[#1a1a1a] border border-white/5 rounded-xl p-5">
            <h2 className="font-syne text-base font-bold mb-4">Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
              {meta.map(([key, val]) => (
                <div key={key}>
                  <p className="text-xs text-white/30 mb-0.5">{key}</p>
                  <p className="text-sm font-medium">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.keys(groupedConnections).length > 0 && (
          <div className="mb-8">
            <h2 className="font-syne text-lg font-bold mb-4">Related & Spinoffs</h2>
            <div className="space-y-5">
              {Object.entries(groupedConnections).map(([type, items]) => (
                <div key={type}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-2">
                    {type.replace('_', ' ')}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {items.map((c, i) => (
                      <Link key={i} href={`/title/${c.slug}`}
                        className="flex items-center gap-2 bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 hover:border-white/15 transition">
                        {c.cover && (
                          <div className="relative w-8 h-10 rounded overflow-hidden shrink-0">
                            <Image src={c.cover} alt="" fill className="object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium leading-snug max-w-[140px] line-clamp-2">{c.name}</p>
                          {c.type && <MediaBadge type={c.type} small />}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {title.reviews && title.reviews.length > 0 && (
          <div>
            <h2 className="font-syne text-lg font-bold mb-4">Reviews</h2>
            <div className="space-y-3">
              {title.reviews.map(r => (
                <div key={r.id} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{r.username}</span>
                    <span className="text-yellow-400 text-sm">★ {r.rating}/10</span>
                  </div>
                  {r.spoiler && <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded mb-2 inline-block">Spoiler</span>}
                  <p className="text-sm text-white/50 leading-relaxed">{r.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
