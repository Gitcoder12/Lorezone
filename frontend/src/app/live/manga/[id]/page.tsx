'use client'
// Manga detail — same structure as anime
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Star, BookOpen, Users } from 'lucide-react'
import Navbar from '../../../../components/Navbar'
import Footer from '../../../../components/Footer'
import MediaBadge from '../../../../components/MediaBadge'
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
export default function MangaDetailPage() {
  const { id } = useParams(); const router = useRouter()
  const [data, setData] = useState<any>(null); const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview'|'characters'|'relations'>('overview')
  useEffect(() => {
    fetch(`${API}/api/live/manga/${id}`).then(r=>r.json()).then(d=>{setData(d);setLoading(false)}).catch(()=>setLoading(false))
  }, [id])
  if (loading) return <div className="min-h-screen"><Navbar /><div className="h-72 bg-white/5 animate-pulse" /><div className="max-w-6xl mx-auto px-4 py-8 space-y-4 animate-pulse"><div className="h-8 bg-white/5 rounded w-64"/><div className="h-32 bg-white/5 rounded"/></div></div>
  if (!data||data.error) return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center"><div className="text-center"><p className="text-white/40 mb-4">Not found</p><button onClick={()=>router.back()} className="text-[#e24b4a] hover:underline">Go back</button></div></div></div>
  const banner=data.bannerImage||data.anilist?.bannerImage
  const cover=data.coverImageXL||data.images?.jpg?.large_image_url
  const title=data.title_english||data.title
  const score=data.score||(data.anilist?.averageScore?data.anilist.averageScore/10:null)
  const genres=data.genres?.map((g:any)=>g.name)||data.anilist?.genres||[]
  const authors=(data.authors||[]).map((a:any)=>a.name)
  const relations=data.relations||[]; const characters=data.characters||[]
  const synopsis=data.synopsis||data.anilist?.description?.replace(/<[^>]*>/g,'')||''
  const relGrouped=relations.reduce((acc:any,r:any)=>{if(!acc[r.relation])acc[r.relation]=[];acc[r.relation].push(r);return acc},{})
  return (
    <div className="min-h-screen"><Navbar />
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-[#1a1a1a]">
        {banner?<Image src={banner} alt="" fill className="object-cover object-center" priority/>:<div className="absolute inset-0 bg-gradient-to-br from-orange-900/30 to-[#0f0f0f]"/>}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent"/>
        <button onClick={()=>router.back()} className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/50 backdrop-blur rounded-full px-3 py-1.5 text-sm text-white/70 hover:text-white transition"><ArrowLeft className="w-4 h-4"/> Back</button>
      </div>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-6 -mt-20 relative z-10 mb-8">
          <div className="relative w-32 md:w-44 shrink-0 aspect-[2/3] rounded-xl overflow-hidden border-2 border-[#0f0f0f] shadow-2xl bg-[#1a1a1a]">
            {cover?<Image src={cover} alt={title} fill className="object-cover"/>:<div className="absolute inset-0 flex items-center justify-center text-4xl">📖</div>}
          </div>
          <div className="flex-1 min-w-0 pt-24">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <MediaBadge type={data.type?.toLowerCase()||'manga'}/>
              {data.status&&<span className="text-xs px-2 py-0.5 bg-white/5 rounded text-white/40">{data.status}</span>}
              {data.publishing===false&&<span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded">Completed</span>}
            </div>
            <h1 className="font-syne text-2xl md:text-4xl font-bold mb-1 leading-tight">{title}</h1>
            {data.title!==title&&<p className="text-white/40 text-sm mb-3">{data.title}</p>}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {score&&<div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/><span className="font-bold text-lg">{Number(score).toFixed(1)}</span><span className="text-white/30 text-sm">/10</span></div>}
              {data.chapters&&<span className="text-sm text-white/40 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5"/> {data.chapters} ch</span>}
              {data.volumes&&<span className="text-sm text-white/40">{data.volumes} vol</span>}
              {authors[0]&&<span className="text-sm text-white/40">{authors[0]}</span>}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {genres.slice(0,8).map((g:string)=><span key={g} className="text-xs px-2.5 py-1 bg-white/5 rounded-full text-white/50">{g}</span>)}
            </div>
            {data.url&&<a href={data.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm transition w-fit"><ExternalLink className="w-3.5 h-3.5"/> MAL Page</a>}
          </div>
        </div>
        <div className="flex gap-1 border-b border-white/5 mb-6">
          {(['overview','characters','relations'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${tab===t?'border-[#e24b4a] text-white':'border-transparent text-white/40 hover:text-white/70'}`}>{t}</button>
          ))}
        </div>
        {tab==='overview'&&(
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10">
            <div className="md:col-span-2 space-y-6">
              {synopsis&&<div><h2 className="font-syne text-lg font-bold mb-3">Synopsis</h2><p className="text-white/60 text-sm leading-relaxed">{synopsis}</p></div>}
            </div>
            <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 h-fit">
              <h3 className="font-syne font-bold text-sm mb-4 text-white/70 uppercase tracking-wider">Details</h3>
              <div className="space-y-2.5">
                {[['Type',data.type],['Chapters',data.chapters],['Volumes',data.volumes],['Status',data.status],['Published',data.published?.string],['Authors',authors.join(', ')],['Serialization',data.serializations?.[0]?.name],['Rank',data.rank?`#${data.rank}`:null]].filter(([,v])=>v).map(([k,v])=>(
                  <div key={k as string} className="flex justify-between gap-2"><span className="text-xs text-white/30">{k}</span><span className="text-xs text-right font-medium max-w-[60%] truncate">{v as string}</span></div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab==='characters'&&(
          <div className="pb-10">{characters.length===0?<p className="text-white/30 text-sm py-8 text-center">No character data</p>:(
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {characters.map((c:any,i:number)=>(
                <div key={i} className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                  <div className="relative aspect-[3/4] bg-[#222]">
                    {c.character?.images?.jpg?.image_url?<Image src={c.character.images.jpg.image_url} alt="" fill className="object-cover object-top" sizes="200px"/>:<div className="absolute inset-0 flex items-center justify-center text-3xl">👤</div>}
                  </div>
                  <div className="p-2"><p className="text-xs font-medium line-clamp-1">{c.character?.name}</p><p className="text-[10px] text-white/30">{c.role}</p></div>
                </div>
              ))}
            </div>
          )}</div>
        )}
        {tab==='relations'&&(
          <div className="pb-10 space-y-6">
            {Object.keys(relGrouped).length===0?<p className="text-white/30 text-sm py-8 text-center">No relations data</p>:
              Object.entries(relGrouped).map(([rel,items]:[string,any])=>(
                <div key={rel}><p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-3">{rel}</p>
                  <div className="flex flex-wrap gap-3">
                    {items.map((r:any,i:number)=>(
                      <Link key={i} href={`/live/${r.entry?.[0]?.type==='anime'?'anime':'manga'}/${r.entry?.[0]?.mal_id||r.mal_id}`} className="flex items-center gap-2 bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 hover:border-white/15 transition">
                        <div><p className="text-xs font-medium">{r.entry?.[0]?.name||r.title}</p>{(r.entry?.[0]?.type||r.type)&&<MediaBadge type={(r.entry?.[0]?.type||r.type)?.toLowerCase()} small/>}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
      <Footer/>
    </div>
  )
}
