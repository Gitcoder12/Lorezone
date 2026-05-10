'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Star, ExternalLink, Play } from 'lucide-react'
import Navbar from '../../../../components/Navbar'
import Footer from '../../../../components/Footer'
import MediaBadge from '../../../../components/MediaBadge'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function LiveTitlePage() {
  const { kind, id } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'info' | 'relations' | 'characters'>('info')

  useEffect(() => {
    fetch(`${API}/api/live/${kind}/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [kind, id])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
          <div className="flex gap-6 mb-8">
            <div className="w-44 aspect-[2/3] bg-white/5 rounded-xl shrink-0" />
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

  if (!data || data.error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/40 mb-4">Could not load this title</p>
            <Link href="/" className="text-[#e24b4a] hover:underline">Go home</Link>
          </div>
        </div>
      </div>
    )
  }

  const img = data.images?.jpg?.large_image_url || data.images?.jpg?.image_url
  const title = data.title_english || data.title
  const mediaType = kind === 'anime' ? (data.type?.toLowerCase() === 'tv' ? 'anime' : data.type?.toLowerCase() || 'anime') : 'manga'

  // Group relations
  const groupedRelations: Record<string, { name: string; type: string; mal_id: number }[]> = {}
  for (const r of (data.relations || [])) {
    if (!groupedRelations[r.relation]) groupedRelations[r.relation] = []
    for (const e of r.entry) groupedRelations[r.relation].push(e)
  }

  const meta: [string, string | number][] = [
    kind === 'anime' ? ['Episodes', data.episodes] : ['Chapters', data.chapters],
    kind === 'anime' ? ['Duration', data.duration] : ['Volumes', data.volumes],
    ['Status', data.status],
    ['Rating', data.rating],
    kind === 'anime' ? ['Season', `${data.season} ${data.year}`] : ['Published', data.published?.string],
    kind === 'anime' ? ['Studio', data.studios?.[0]?.name] : ['Author', data.authors?.[0]?.name],
    ['Source', data.source],
    ['Score', data.score ? `★ ${data.score} (${data.scored_by?.toLocaleString()} votes)` : null],
    ['Rank', data.rank ? `#${data.rank}` : null],
    ['Popularity', data.popularity ? `#${data.popularity}` : null],
  ].filter(([, v]) => v != null && v !== undefined) as [string, string | number][]

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Banner */}
      {img && (
        <div className="relative h-56 overflow-hidden">
          <Image src={img} alt={title} fill className="object-cover blur-sm scale-110 opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f0f0f]" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 pb-16" style={{ marginTop: img ? '-80px' : '0' }}>
        <Link href="javascript:history.back()"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white mb-4 transition relative z-10">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Main info */}
        <div className="flex gap-5 mb-8 relative z-10">
          <div className="relative w-36 md:w-48 aspect-[2/3] rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/5 shrink-0 shadow-2xl">
            {img ? (
              <Image src={img} alt={title} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-5xl">
                {kind === 'anime' ? '🎬' : '📖'}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-2">
            <div className="flex flex-wrap gap-2 mb-2">
              <MediaBadge type={mediaType} />
              {data.status && (
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  data.status === 'Finished Airing' || data.status === 'Finished'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-blue-500/10 text-blue-400'
                }`}>{data.status}</span>
              )}
            </div>

            <h1 className="font-syne text-2xl md:text-4xl font-bold mb-1 leading-tight">{title}</h1>
            {data.title !== title && <p className="text-white/40 text-sm mb-1">{data.title}</p>}
            {data.title_japanese && <p className="text-white/25 text-xs mb-3">{data.title_japanese}</p>}

            {data.score && (
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-2xl">{data.score}</span>
                <span className="text-white/30 text-sm">/ 10 · {data.scored_by?.toLocaleString()} votes</span>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mb-4">
              {(data.genres || []).map((g: { name: string }) => (
                <span key={g.name} className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded text-white/50">{g.name}</span>
              ))}
              {(data.themes || []).map((t: { name: string }) => (
                <span key={t.name} className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded text-white/40">{t.name}</span>
              ))}
            </div>

            {data.trailer?.url && (
              <a href={data.trailer.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#e24b4a] hover:bg-[#c93e3d] transition rounded-full px-4 py-2 text-sm font-medium">
                <Play className="w-3.5 h-3.5" /> Watch Trailer
              </a>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/5 mb-6">
          {(['info', 'relations', 'characters'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
                tab === t ? 'border-[#e24b4a] text-white' : 'border-transparent text-white/40 hover:text-white/70'
              }`}>
              {t}
              {t === 'relations' && ` (${Object.keys(groupedRelations).length})`}
              {t === 'characters' && ` (${data.characters?.length || 0})`}
            </button>
          ))}
        </div>

        {/* Info tab */}
        {tab === 'info' && (
          <div className="space-y-6">
            {data.synopsis && (
              <div>
                <h2 className="font-syne text-lg font-bold mb-3">Synopsis</h2>
                <p className="text-white/60 text-sm leading-relaxed">{data.synopsis}</p>
              </div>
            )}

            <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5">
              <h2 className="font-syne text-base font-bold mb-4">Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                {meta.map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-white/30 mb-0.5">{k}</p>
                    <p className="text-sm font-medium">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {data.background && (
              <div>
                <h2 className="font-syne text-base font-bold mb-2">Background</h2>
                <p className="text-white/50 text-sm leading-relaxed">{data.background}</p>
              </div>
            )}
          </div>
        )}

        {/* Relations tab */}
        {tab === 'relations' && (
          <div className="space-y-6">
            {Object.keys(groupedRelations).length === 0 ? (
              <p className="text-white/30 text-sm py-8 text-center">No relations found</p>
            ) : (
              Object.entries(groupedRelations).map(([rel, entries]) => (
                <div key={rel}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-3">{rel}</p>
                  <div className="flex flex-wrap gap-3">
                    {entries.map((e, i) => (
                      <Link
                        key={i}
                        href={`/live/${e.type === 'anime' ? 'anime' : 'manga'}/${e.mal_id}`}
                        className="flex items-center gap-2.5 bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2.5 hover:border-white/15 transition"
                      >
                        <div>
                          <p className="text-xs font-medium max-w-[160px] line-clamp-2">{e.name}</p>
                          <MediaBadge type={e.type === 'anime' ? 'anime' : 'manga'} small />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Characters tab */}
        {tab === 'characters' && (
          <div>
            {!data.characters?.length ? (
              <p className="text-white/30 text-sm py-8 text-center">No character data</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {data.characters.map((c: any, i: number) => (
                  <div key={i} className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                    <div className="relative aspect-[3/4] bg-[#222]">
                      {c.character?.images?.jpg?.image_url ? (
                        <Image src={c.character.images.jpg.image_url} alt={c.character.name} fill className="object-cover object-top" sizes="200px" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-3xl">👤</div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium line-clamp-1">{c.character?.name}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{c.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
