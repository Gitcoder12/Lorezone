'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import Navbar from '../../../../components/Navbar'
import MediaBadge from '../../../../components/MediaBadge'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface TimelineEntry {
  title: {
    id: number
    title: string
    slug: string
    media_type: string
    cover_image: string
    synopsis: string
    avg_rating: number
  }
  position: number
}

interface Timeline {
  id: number
  name: string
  slug: string
  description: string
  timeline_entries: TimelineEntry[]
}

export default function TimelinePage() {
  const { franchise_slug, timeline_slug } = useParams()
  const [timeline, setTimeline] = useState<Timeline | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/timelines/${franchise_slug}/${timeline_slug}`)
      .then(r => r.json())
      .then(d => { setTimeline(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [franchise_slug, timeline_slug])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!timeline) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/40">Timeline not found</p>
        </div>
      </div>
    )
  }

  const entries = (timeline.timeline_entries || []).sort((a, b) => a.position - b.position)

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href={`/franchise/${franchise_slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Franchise
        </Link>

        <h1 className="font-syne text-3xl font-bold mb-1">{timeline.name}</h1>
        {timeline.description && <p className="text-white/40 text-sm mb-8">{timeline.description}</p>}

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />

          <div className="space-y-4">
            {entries.map((entry, i) => (
              <div key={i} className="flex gap-4 relative">
                {/* Dot */}
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border-2 border-[#e24b4a]/50 flex items-center justify-center shrink-0 z-10">
                  <span className="text-xs font-bold text-[#e24b4a]">{entry.position}</span>
                </div>

                <Link
                  href={`/title/${entry.title.slug}`}
                  className="flex-1 flex gap-3 bg-[#1a1a1a] border border-white/5 rounded-xl p-3 hover:border-white/15 transition mb-0"
                >
                  {entry.title.cover_image && (
                    <div className="relative w-12 aspect-[2/3] rounded overflow-hidden shrink-0">
                      <Image src={entry.title.cover_image} alt="" fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm mb-1 line-clamp-1">{entry.title.title}</p>
                    <div className="flex items-center gap-2">
                      <MediaBadge type={entry.title.media_type} small />
                      {entry.title.avg_rating && (
                        <span className="text-xs text-white/30">★ {entry.title.avg_rating}</span>
                      )}
                    </div>
                    {entry.title.synopsis && (
                      <p className="text-xs text-white/30 mt-1 line-clamp-2">{entry.title.synopsis}</p>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
