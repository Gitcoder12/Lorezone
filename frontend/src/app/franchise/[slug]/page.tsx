'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Clock3, Layers3, Sparkles } from 'lucide-react'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import TitleCard from '../../../components/TitleCard'
import { Franchise, Title } from '../../types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const MEDIA_ORDER = [
  'anime', 'manga', 'movie', 'ova', 'ona', 'special',
  'manhwa', 'novel', 'spin_off', 'comic', 'game', 'series',
]

export default function FranchisePage() {
  const params = useParams()
  const slug = params.slug as string
  const [franchise, setFranchise] = useState<Franchise | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (!slug) return
    const controller = new AbortController()
    setLoading(true)
    fetch(\`\${API}/api/franchises/\${encodeURIComponent(slug)}\`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Franchise not found')
        return response.json()
      })
      .then(data => {
        if (!controller.signal.aborted) setFranchise(data)
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [slug])

  const titles = franchise?.titles || []
  const byType = useMemo(() => titles.reduce((acc, title) => {
    if (!acc[title.media_type]) acc[title.media_type] = []
    acc[title.media_type].push(title)
    return acc
  }, {} as Record<string, Title[]>), [titles])

  const types = MEDIA_ORDER.filter(type => byType[type])
  const tabs = ['all', ...types]
  const displayed = activeTab === 'all' ? titles : (byType[activeTab] || [])
  const cover = franchise?.cover_image

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="franchise-loading page-shell">
          <div className="franchise-loading__hero" />
          <div className="franchise-loading__grid">
            {Array.from({ length: 6 }).map((_, index) => <div key={index} />)}
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !franchise) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="directory-empty page-shell">
          <p className="eyebrow">UNIVERSE NOT FOUND</p>
          <h1>This story hasn’t been mapped yet.</h1>
          <p>The universe may not exist in the catalogue, or the service may be unavailable.</p>
          <Link href="/franchises" className="secondary-button"><ArrowLeft size={15} /> Back to universes</Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <section className="franchise-hero">
          {cover ? (
            <div className="franchise-hero__art">
              <Image src={cover} alt="" fill priority sizes="100vw" />
            </div>
          ) : null}
          <div className="franchise-hero__shade" />
          <div className="page-shell franchise-hero__content">
            <Link href="/franchises" className="franchise-back"><ArrowLeft size={15} /> All universes</Link>
            <div className="franchise-hero__copy">
              <p className="eyebrow">CONNECTED UNIVERSE</p>
              {franchise.logo ? (
                <div className="franchise-logo">
                  <Image src={franchise.logo} alt={franchise.name} fill sizes="(max-width: 640px) 60vw, 340px" />
                </div>
              ) : (
                <h1>{franchise.name}</h1>
              )}
              {franchise.description ? <p className="franchise-hero__description">{franchise.description}</p> : null}
              <div className="franchise-hero__stats">
                <span><Layers3 size={14} /> {titles.length} titles</span>
                {types.length ? <span><Sparkles size={14} /> {types.length} media formats</span> : null}
                {franchise.avg_rating ? <span>★ {Number(franchise.avg_rating).toFixed(1)} average</span> : null}
              </div>
            </div>
          </div>
          <div className="franchise-hero__bottom">
            <div className="page-shell"><span>ONE UNIVERSE</span><i /> MANY WAYS INTO THE STORY</div>
          </div>
        </section>

        <div className="page-shell franchise-content">
          {franchise.timelines && franchise.timelines.length > 0 ? (
            <section className="timeline-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">CHOOSE YOUR PATH</p>
                  <h2>Story timelines</h2>
                </div>
                <Clock3 size={18} />
              </div>
              <div className="timeline-links">
                {franchise.timelines.map(timeline => (
                  <Link
                    key={timeline.id}
                    href={\`/timeline/\${franchise.slug}/\${timeline.slug}\`}
                    className="timeline-link"
                  >
                    <span>{timeline.is_primary ? 'PRIMARY TIMELINE' : 'ALTERNATE PATH'}</span>
                    <strong>{timeline.name}</strong>
                    {timeline.description ? <small>{timeline.description}</small> : null}
                    <ArrowUpRight size={16} />
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="franchise-catalogue">
            <div className="section-heading">
              <div>
                <p className="eyebrow">THE COMPLETE COLLECTION</p>
                <h2>Explore every chapter</h2>
                <p className="section-heading__description">Filter the universe by the kind of story you want.</p>
              </div>
              <span className="catalogue-total">{titles.length} entries</span>
            </div>

            <div className="filter-row" role="tablist" aria-label="Filter by media type">
              {tabs.map(tab => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={\`filter-pill \${activeTab === tab ? 'is-active' : ''}\`}
                >
                  {tab === 'all' ? 'Everything' : tab.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())}
                  <span>{tab === 'all' ? titles.length : byType[tab]?.length || 0}</span>
                </button>
              ))}
            </div>

            {displayed.length === 0 ? (
              <div className="directory-empty directory-empty--compact">
                <h2>No entries in this collection yet.</h2>
                <p>Try another media type or return to the full universe.</p>
              </div>
            ) : (
              <div className="title-library-grid">
                {displayed.map(title => <TitleCard key={title.id} title={title} />)}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
