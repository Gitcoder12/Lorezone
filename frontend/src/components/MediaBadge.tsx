import { MediaType } from '../app/types'

const config: Record<string, { label: string; bg: string; text: string }> = {
  anime:    { label: 'Anime',       bg: '#1a2e45', text: '#5aacf5' },
  manga:    { label: 'Manga',       bg: '#3a1a10', text: '#f5905a' },
  movie:    { label: 'Movie',       bg: '#3a2e10', text: '#f5c55a' },
  ova:      { label: 'OVA',         bg: '#1a3a1a', text: '#5af55a' },
  ona:      { label: 'ONA',         bg: '#2a1a3a', text: '#ac5af5' },
  special:  { label: 'Special',     bg: '#3a1a2e', text: '#f55aac' },
  manhwa:   { label: 'Manhwa',      bg: '#1a3a2e', text: '#5af5ac' },
  novel:    { label: 'Novel',       bg: '#2a2a2a', text: '#aaaaaa' },
  spin_off: { label: 'Spin-off',    bg: '#2e2a10', text: '#f5d05a' },
  comic:    { label: 'Comic',       bg: '#10202e', text: '#5ac5f5' },
  game:     { label: 'Game',        bg: '#102e10', text: '#5af570' },
  series:   { label: 'Series',      bg: '#1a1a3a', text: '#7a7af5' },
}

export default function MediaBadge({ type, small }: { type: string; small?: boolean }) {
  const c = config[type?.toLowerCase()] || config.anime
  return (
    <span
      style={{ background: c.bg, color: c.text }}
      className={`rounded font-semibold ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'}`}
    >
      {c.label}
    </span>
  )
}
