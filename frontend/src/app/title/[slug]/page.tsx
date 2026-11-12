'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, ExternalLink, Star } from 'lucide-react'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import MediaBadge from '../../../components/MediaBadge'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface ConnectionRecord {
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
  end_date?: string
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
  banner_image?: string
  trailer_url: string
  avg_rating: number
  language: string
  is_completed: boolean
  tags: { id: number; name: string }[]
  connections: { outgoing: ConnectionRecord[]; incoming: ConnectionRecord[] }
  reviews: Review[]
}

interface RelatedTitle {
  id: number
  name?: string
  slug?: string
  type?: string
  cover?: string
  connection_type: string
  description?: string
}

export default function TitlePage() {
  const params = useParams()
  const slug = params.slug as string
  const [title, setTitle] = useState<FullTitle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return
    const controller = new AbortController()
    setLoading(true)
    fetch(\`\${API}/api/titles/\${encodeURIComponent(slug)}\`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Title not found')
        return response.json()
      })
      .then(data => {
        if (!controller.signal.aborted) setTitle(data)
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [slug])

  const related = useMemo<RelatedTitle[]>(() => {
    if (!title?.connections) return []
    const outgoing = (title.connections.outgoing || []).map(connection => ({
      id: connection.id,
      name: connection.target_title,
      slug: connection.target_slug,
      type: connection.target_media_type,
      cover: connection.target_cover,
      connection_type: connection.connection_type,
      description: connection.description,
    }))
    const incoming = (title.connections.incoming || []).map(connection => ({
      id: connection.id,
      name: connection.source_title,
      slug: connection.source_slug,
      type: connection.source_media_type,
      cover: connection.source_cover,
      connection_type: connection.connection_type,
      description: connection.description,
    }))
    return [...outgoing, ...incoming]
  }, [title])

  const grouped = useMemo(() => related.reduce((groups, item) => {
    const key = item.connection_type || 'related'
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
    return groups
  }, {} as Record<string, RelatedTitle[]>), [related])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-shell title-loading">
          <div className="title-loading__poster" />
          <div className="title-loading__copy"><i /><i /><i /></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !title) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="directory-empty page-shell">
          <p className="eyebrow">STORY NOT FOUND</p>
          <h1>This chapter is missing.</h1>
          <p>It may not be in the catalogue yet, or the service may be unavailable.</p>
          <Link href="/titles" className="secondary-button"><ArrowLeft size={15} /> Back to titles</Link>
        </main>
        <Footer />
      </div>
    )
  }

  const poster = title.cover_image
  const backdrop = title.banner_image || poster
  const releaseYear = title.release_date ? new Date(title.release_date).getFullYear() : null
  const meta: [string, string | number][] = [
    ['Studio', title.studio],
    ['Author', title.author],
    ['Artist', title.artist],
    ['Publisher', title.publisher],
    ['Episodes', title.episode_count || ''],
    ['Chapters', title.chapter_count || ''],
    ['Volumes', title.volume_count || ''],
    ['Runtime', title.runtime_minutes ? \`\${title.runtime_minutes} min\` : ''],
    ['Language', title.language],
    ['Status', title.is_completed ? 'Completed' : 'Ongoing'],
    ['Released', releaseYear || ''],
  ].filter(([, value]) => Boolean(value)) as [string, string | number][]

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <section className="title-backdrop">
          {backdrop ? (
            <div className="title-backdrop__art">
              <Image src={backdrop} alt="" fill priority sizes="100vw" />
            </div>
          ) : null}
          <div className="title-backdrop__shade" />
          <div className="title-backdrop__content">
            <div className="title-poster">
              {poster ? <Image src={poster} alt={title.title} fill priority sizes="190px" /> : null}
            </div>
            <div className="title-main">
              <div className="title-breadcrumbs">
                <Link href="/titles">Catalogue</Link><span>/</span>
                {title.franchise_name && title.franchise_slug ? (
                  <><Link href={\`/franchise/\${title.franchise_slug}\`}>{title.franchise_name}</Link><span>/</span></>
                ) : null}
                <span>{title.title}</span>
              </div>
              <div className="title-badges">
                <MediaBadge type={title.media_type} />
                {title.is_completed ? <span className="completion-badge">Completed</span> : <span className="completion-badge completion-badge--live">Ongoing</span>}
              </div>
              <h1>{title.title}</h1>
              {title.franchise_name ? <p className="title-franchise-name">{title.franchise_name} universe</p> : null}
              <div className="title-main__rating">
                {title.avg_rating ? <><Star size={16} fill="currentColor" /><strong>{Number(title.avg_rating).toFixed(1)}</strong><span>/ 10</span></> : <span>Rating not available</span>}
                {releaseYear ? <><i />{releaseYear}</> : null}
              </div>
              {title.tags?.length ? (
                <div className="title-tag-list">
                  {title.tags.slice(0, 6).map(tag => <span key={tag.id}>{tag.name}</span>)}
                </div>
              ) : null}
              {title.trailer_url ? (
                <a href={title.trailer_url} target="_blank" rel="noopener noreferrer" className="primary-button title-trailer">
                  Watch trailer <ExternalLink size={14} />
                </a>
              ) : null}
            </div>
          </div>
        </section>

        <div className="page-shell title-detail-content">
          <div className="title-detail-main">
            {title.synopsis ? (
              <section className="title-story-block">
                <p className="eyebrow">THE STORY</p>
                <h2>About this title</h2>
                <p>{title.synopsis}</p>
              </section>
            ) : null}

            {meta.length ? (
              <section className="detail-panel">
                <p className="eyebrow">AT A GLANCE</p>
                <h2>Title information</h2>
                <div className="detail-grid">
                  {meta.map(([key, value]) => (
                    <div key={key}><small>{key}</small><strong>{value}</strong></div>
                  ))}
                </div>
              </section>
            ) : null}

            {Object.keys(grouped).length ? (
              <section className="related-section">
                <div className="section-heading">
                  <div><p className="eyebrow">FOLLOW THE THREAD</p><h2>Connected stories</h2></div>
                  <span className="catalogue-total">{related.length} links</span>
                </div>
                <div className="related-groups">
                  {Object.entries(grouped).map(([kind, items]) => (
                    <div className="related-group" key={kind}>
                      <p className="related-group__label">{kind.replace('_', ' ')}</p>
                      <div className="related-grid">
                        {items.map((item, index) => (
                          item.slug ? (
                            <Link href={\`/title/\${item.slug}\`} className="related-card" key={\`\${item.id}-\${index}\`}>
                              <span className="related-card__image">
                                {item.cover ? <Image src={item.cover} alt="" fill sizes="64px" /> : null}
                              </span>
                              <span className="related-card__copy">
                                <strong>{item.name || 'Untitled entry'}</strong>
                                {item.type ? <small>{item.type}</small> : null}
                                {item.description ? <small>{item.description}</small> : null}
                              </span>
                              <ArrowUpRight size={15} />
                            </Link>
                          ) : null
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {title.reviews?.length ? (
              <section className="related-section">
                <div className="section-heading"><div><p className="eyebrow">FROM THE COMMUNITY</p><h2>Reviews</h2></div></div>
                <div className="review-list">
                  {title.reviews.map(review => (
                    <article className="review-card" key={review.id}>
                      <div className="review-card__top">
                        <strong>{review.username}</strong>
                        <span><Star size={12} fill="currentColor" /> {review.rating}/10</span>
                      </div>
                      {review.spoiler ? <small className="spoiler-label">Contains spoilers</small> : null}
                      <p>{review.content}</p>
                      <time>{new Date(review.created_at).toLocaleDateString()}</time>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
          <aside className="title-detail-aside">
            <div className="detail-aside-card">
              <p className="eyebrow">KEEP EXPLORING</p>
              <h3>There’s more to this universe.</h3>
              <p>See the other titles connected to this story, all in one place.</p>
              {title.franchise_slug ? (
                <Link href={\`/franchise/\${title.franchise_slug}\`} className="secondary-button">
                  Open universe <ArrowUpRight size={14} />
                </Link>
              ) : (
                <Link href="/franchises" className="secondary-button">
                  Explore universes <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
