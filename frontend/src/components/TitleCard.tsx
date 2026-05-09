import Link from 'next/link'
import Image from 'next/image'
import { Title } from '../app/types'
import MediaBadge from './MediaBadge'

export default function TitleCard({ title }: { title: Title }) {
  const img = title.cover_image
  const emoji = ['anime', 'movie', 'ova', 'ona', 'special', 'series'].includes(title.media_type) ? '🎬' : '📖'

  return (
    <Link
      href={`/title/${title.slug}`}
      className="group bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden hover:-translate-y-1 hover:border-white/15 transition-all duration-200 block"
    >
      <div className="relative aspect-[2/3] bg-[#222]">
        {img ? (
          <Image
            src={img}
            alt={title.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl">{emoji}</div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-medium line-clamp-2 mb-1.5 leading-snug">{title.title}</p>
        <div className="flex items-center justify-between gap-1 flex-wrap">
          <MediaBadge type={title.media_type} small />
          {title.avg_rating && (
            <span className="text-[10px] text-white/40">★ {title.avg_rating}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
