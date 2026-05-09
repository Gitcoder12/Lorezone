'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'
import Navbar from '../../../components/Navbar'
import TitleCard from '../../../components/TitleCard'
import MediaBadge from '../../../components/MediaBadge'
import { Franchise, Title } from '../../types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const MEDIA_ORDER = ['anime', 'manga', 'movie', 'ova', 'ona', 'special', 'manhwa', 'novel', 'spin_off', 'comic', 'game', 'series']

export default function FranchisePage() {
  const { slug } = useParams()
  const [franchise, setFranchise] = useState<Franchise | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('all')

  useEffect(() => {
    fetch(`${API}/api/franchises/${slug}`)
      .then(r => r.json())
      .then(d => { setFranchise(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="h-8 bg-white/5 rounded w-48 mb-4 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!franchise) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/40 mb-4">Franchise not found</p>
            <Link href="/" className="text-[#e24b4a] hover:underline">Go home</Link>
          </div>
        </div>
      </div>
    )
  }

  const titles = franchise.titles || []
  const byType = titles.reduce((acc, t) => {
    if (!acc[t.media_type]) acc[t.media_type] = []
    acc[t.media_type].push(t)
    return acc
  }, {} as Record<string, Title[]>)

  const types = MEDIA_ORDER.filter(t => byType[t])
  const tabs = ['all', ...types]

  const displayed = activeTab === 'all' ? titles : (byType[activeTab] || [])

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-b from-[#e24b4a]/10 to-transparent pt-8 pb-6 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/franchises" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white mb-4 transition">
            <ArrowLeft className="w-4 h-4" /> All Franchises
          </Link>
          <h1 className="font-syne text-4xl md:text-5xl font-bold mb-2">{franchise.name}</h1>
          {franchise.description && (
            <p className="text-white/50 max-w-2xl text-sm leading-relaxed">{franchise.description}</p>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap gap-3 mt-4">
            {types.map(t => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-white/30">
                <MediaBadge type={t} small />
                <span>{byType[t].length}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Timelines */}
        {franchise.timelines && franchise.timelines.length > 0 && (
          <div className="mb-8 pt-6">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Timelines
            </h2>
            <div className="flex flex-wrap gap-2">
              {franchise.timelines.map(tl => (
                <Link
                  key={tl.id}
                  href={`/timeline/${franchise.slug}/${tl.slug}`}
                  className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm hover:bg-white/10 transition"
                >
                  {tl.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/5 mb-6 overflow-x-auto pt-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#e24b4a] text-white'
                  : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              {tab === 'all' ? 'All' : tab.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              <span className="ml-1.5 text-xs text-white/25">
                {tab === 'all' ? titles.length : byType[tab]?.length}
              </span>
            </button>
          ))}
        </div>

        {/* Grid */}
        {displayed.length === 0 ? (
          <p className="text-white/30 text-sm py-8 text-center">Nothing here yet</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayed.map(t => <TitleCard key={t.id} title={t} />)}
          </div>
        )}
      </div>
    </div>
  )
}
