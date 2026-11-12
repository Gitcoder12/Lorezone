import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Star } from 'lucide-react'
import { Title } from '../app/types'
import MediaBadge from './MediaBadge'

export default function TitleCard({ title }: { title: Title }) {
  const isVisual = ['anime', 'movie', 'ova', 'ona', 'special', 'series'].includes(title.media_type)
  const releaseYear = title.release_date ? new Date(title.release_date).getFullYear() : null

  return (
    <Link href={\`/title/\${title.slug}\`} className="title-library-card group">
      <div className="title-library-card__art">
        {title.cover_image ? (
          <Image
            src={title.cover_image}
            alt={title.title}
            fill
            sizes="(max-width: 640px) 44vw, (max-width: 1024px) 28vw, 190px"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="title-library-card__placeholder">{isVisual ? 'FILM / SERIES' : 'PRINT / STORY'}</div>
        )}
        <div className="title-library-card__shade" />
        {title.avg_rating ? (
          <span className="title-library-card__rating">
            <Star size={11} fill="currentColor" /> {Number(title.avg_rating).toFixed(1)}
          </span>
        ) : null}
        <span className="title-library-card__open">View details <ArrowUpRight size={13} /></span>
      </div>
      <div className="title-library-card__meta">
        <h3 title={title.title}>{title.title}</h3>
        <div>
          <MediaBadge type={title.media_type} small />
          {releaseYear ? <span>{releaseYear}</span> : null}
        </div>
      </div>
    </Link>
  )
}
