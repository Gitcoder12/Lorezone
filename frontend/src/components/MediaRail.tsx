'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Star } from 'lucide-react'

export interface CatalogueMedia {
  mal_id: number
  title: string
  title_english?: string
  images?: {
    jpg?: { image_url?: string; large_image_url?: string }
    webp?: { image_url?: string; large_image_url?: string }
  }
  score?: number | null
  type?: string | null
  episodes?: number | null
  chapters?: number | null
  status?: string | null
  year?: number | null
}

interface MediaRailProps {
  title: string
  eyebrow: string
  description?: string
  items: CatalogueMedia[]
  kind: 'anime' | 'manga'
  href: string
  loading?: boolean
}

function PosterCard({
  item,
  kind,
  index,
}: {
  item: CatalogueMedia
  kind: 'anime' | 'manga'
  index: number
}) {
  const image =
    item.images?.webp?.large_image_url ||
    item.images?.jpg?.large_image_url ||
    item.images?.webp?.image_url ||
    item.images?.jpg?.image_url
  const label = item.title_english || item.title

  return (
    <Link
      href={`/live/${kind}/${item.mal_id}`}
      className="poster-card group"
      aria-label={`Open ${label}`}
    >
      <div className="poster-card__art">
        {image ? (
          <Image
            src={image}
            alt={label}
            fill
            sizes="(max-width: 640px) 42vw, (max-width: 1024px) 24vw, 185px"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="poster-card__placeholder">
            <span>{kind === 'anime' ? 'ANIME' : 'MANGA'}</span>
          </div>
        )}
        <div className="poster-card__shade" />
        <span className="poster-card__rank">{String(index + 1).padStart(2, '0')}</span>
        {item.score ? (
          <span className="poster-card__score">
            <Star size={11} fill="currentColor" /> {item.score.toFixed(1)}
          </span>
        ) : null}
        <span className="poster-card__open">View title <span aria-hidden="true">↗</span></span>
      </div>
      <div className="poster-card__meta">
        <h3 title={label}>{label}</h3>
        <p>
          <span>{item.type || (kind === 'anime' ? 'Anime' : 'Manga')}</span>
          {item.year ? <><i />{item.year}</> : null}
          {kind === 'anime' && item.episodes ? <><i />{item.episodes} eps</> : null}
          {kind === 'manga' && item.chapters ? <><i />{item.chapters} ch</> : null}
        </p>
      </div>
    </Link>
  )
}

export default function MediaRail({
  title,
  eyebrow,
  description,
  items,
  kind,
  href,
  loading = false,
}: MediaRailProps) {
  const railRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    railRef.current?.scrollBy({
      left: direction === 'right' ? 640 : -640,
      behavior: 'smooth',
    })
  }

  return (
    <section className="media-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          {description ? <p className="section-heading__description">{description}</p> : null}
        </div>
        <div className="section-heading__actions">
          <Link href={href} className="text-link">
            Explore all <span aria-hidden="true">↗</span>
          </Link>
          <div className="rail-controls">
            <button type="button" aria-label={`Scroll ${title} left`} onClick={() => scroll('left')}>
              <ArrowLeft size={17} />
            </button>
            <button type="button" aria-label={`Scroll ${title} right`} onClick={() => scroll('right')}>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>

      <div className="media-rail" ref={railRef}>
        {loading
          ? Array.from({ length: 7 }).map((_, index) => (
              <div className="poster-skeleton" key={index}>
                <div className="poster-skeleton__image" />
                <div className="poster-skeleton__line" />
                <div className="poster-skeleton__line poster-skeleton__line--short" />
              </div>
            ))
          : items.map((item, index) => (
              <PosterCard key={item.mal_id} item={item} kind={kind} index={index} />
            ))}
        {!loading && items.length === 0 ? (
          <div className="empty-shelf">
            <span>Nothing on this shelf yet.</span>
            <Link href={href}>Explore the catalogue →</Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
