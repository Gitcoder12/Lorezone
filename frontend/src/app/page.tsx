'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clapperboard,
  Compass,
  Search,
  Sparkles,
  Swords,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MediaRail, { CatalogueMedia } from '../components/MediaRail'
import { Franchise } from './types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface HomeCatalogue {
  topAnime: CatalogueMedia[]
  topManga: CatalogueMedia[]
  airing: CatalogueMedia[]
  franchises: Franchise[]
}

const emptyCatalogue: HomeCatalogue = {
  topAnime: [],
  topManga: [],
  airing: [],
  franchises: [],
}

const quickPaths = [
  { href: '/browse/anime', title: 'Anime', detail: 'Series & films', icon: Clapperboard },
  { href: '/browse/manga', title: 'Manga', detail: 'Print & digital', icon: BookOpen },
  { href: '/franchises', title: 'Universes', detail: 'Connected stories', icon: Compass },
  { href: '/schedule', title: 'On the calendar', detail: 'What’s airing', icon: CalendarDays },
]

async function readApi(path: string, signal: AbortSignal) {
  const response = await fetch(`${API}${path}`, { signal })
  if (!response.ok) throw new Error(`Request failed: ${response.status}`)
  return response.json()
}

export default function HomePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [catalogue, setCatalogue] = useState<HomeCatalogue>(emptyCatalogue)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      readApi('/api/live/top/anime?filter=bypopularity&limit=24', controller.signal)
        .catch(() => ({ data: [] })),
      readApi('/api/live/top/manga?filter=bypopularity&limit=24', controller.signal)
        .catch(() => ({ data: [] })),
      readApi('/api/live/season/now?page=1', controller.signal)
        .catch(() => ({ data: [] })),
      readApi('/api/franchises', controller.signal).catch(() => []),
    ])
      .then(([anime, manga, airing, franchises]) => {
        if (controller.signal.aborted) return
        setCatalogue({
          topAnime: anime.data || [],
          topManga: manga.data || [],
          airing: airing.data || [],
          franchises: Array.isArray(franchises) ? franchises : [],
        })
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  const featured = catalogue.topAnime[0] || catalogue.airing[0]
  const featuredImage =
    featured?.images?.webp?.large_image_url ||
    featured?.images?.jpg?.large_image_url ||
    featured?.images?.jpg?.image_url
  const featuredTitle = featured?.title_english || featured?.title || 'Find your next world'
  const featuredSynopsis = useMemo(() => {
    if (!featured) {
      return 'Trace every universe, discover the stories inside it, and find the next thing worth getting lost in.'
    }
    const synopsis = (featured as CatalogueMedia & { synopsis?: string }).synopsis || ''
    return synopsis.length > 185 ? `${synopsis.slice(0, 182).trim()}…` : synopsis
  }, [featured])

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        <section className="home-hero">
          {featuredImage ? (
            <div className="home-hero__art">
              <Image
                src={featuredImage}
                alt=""
                fill
                priority
                sizes="(max-width: 820px) 100vw, 72vw"
              />
            </div>
          ) : null}
          <div className="home-hero__orb" />

          <div className="home-hero__inner">
            <div className="hero-copy">
              <div className="hero-kicker"><span /> THE STORYVERSE, ORGANIZED</div>
              <h1>
                Every world.<br />
                <em>Every story.</em><br />
                One destination.
              </h1>
              <p className="hero-copy__description">
                {featuredSynopsis || 'Discover anime, manga, films, spin-offs and the connections between them. Follow the whole universe.'}
              </p>

              <div className="hero-actions">
                <Link href="/franchises" className="primary-button">
                  Explore universes <ArrowUpRight size={16} />
                </Link>
                <Link href="/browse/anime" className="secondary-button">
                  Discover anime <ArrowRight size={16} />
                </Link>
              </div>

              <form className="hero-search" onSubmit={submitSearch} role="search">
                <Search size={18} />
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search a story, character, series or universe..."
                  aria-label="Search LoreZone"
                />
                <button type="submit">Search</button>
              </form>

              <div className="hero-bottom-note">
                <span /> DISCOVER THE CONNECTIONS BEHIND THE STORIES
              </div>
            </div>

            <div className="hero-aside">
              {featured ? (
                <Link href={`/live/anime/${featured.mal_id}`} className="hero-feature-card">
                  <span className="hero-feature-card__image">
                    {featuredImage ? (
                      <Image src={featuredImage} alt="" fill sizes="75px" />
                    ) : null}
                  </span>
                  <span className="hero-feature-card__copy">
                    <small>IN THE SPOTLIGHT</small>
                    <strong>{featuredTitle}</strong>
                    <span>{featured.score ? `★ ${featured.score.toFixed(1)} · ` : ''}{featured.type || 'Anime'}</span>
                  </span>
                  <ArrowUpRight className="hero-feature-card__arrow" size={18} />
                </Link>
              ) : (
                <div className="hero-feature-card">
                  <span className="hero-feature-card__image"><Sparkles size={23} /></span>
                  <span className="hero-feature-card__copy">
                    <small>DISCOVERY STARTS HERE</small>
                    <strong>Find your next story</strong>
                    <span>Explore connected worlds</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="page-shell">
          <section className="quick-paths" aria-label="Explore LoreZone">
            {quickPaths.map(({ href, title, detail, icon: Icon }) => (
              <Link href={href} className="quick-path" key={href}>
                <span className="quick-path__icon"><Icon size={18} /></span>
                <span className="quick-path__copy">
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </span>
                <ArrowUpRight size={15} />
              </Link>
            ))}
          </section>

          <MediaRail
            eyebrow="WHAT'S HAPPENING NOW"
            title="Airing this season"
            description="The series currently making their way onto the screen."
            items={catalogue.airing}
            kind="anime"
            href="/schedule"
            loading={loading}
          />

          <MediaRail
            eyebrow="THE CROWD FAVOURITES"
            title="Popular anime"
            description="Start with the titles fans keep coming back to."
            items={catalogue.topAnime}
            kind="anime"
            href="/browse/anime"
            loading={loading}
          />

          <MediaRail
            eyebrow="TURN THE PAGE"
            title="Popular manga"
            description="Stories to read, collect and follow beyond the screen."
            items={catalogue.topManga}
            kind="manga"
            href="/browse/manga"
            loading={loading}
          />

          <section className="universe-section">
            <div className="universe-section__heading">
              <div>
                <p className="eyebrow">MORE THAN A CATALOGUE</p>
                <h2>Enter the universe.</h2>
                <p>
                  A story rarely lives in one place. Explore the franchises
                  that connect original series, adaptations, sequels and spin-offs.
                </p>
              </div>
              <Link href="/franchises" className="text-link">
                All universes <ArrowUpRight size={15} />
              </Link>
            </div>

            <div className="universe-grid">
              {catalogue.franchises.slice(0, 3).map((franchise, index) => (
                <Link
                  href={`/franchise/${franchise.slug}`}
                  className="universe-card"
                  key={franchise.id}
                >
                  {franchise.cover_image ? (
                    <div className="universe-card__image">
                      <Image
                        src={franchise.cover_image}
                        alt=""
                        fill
                        sizes="(max-width: 820px) 80vw, 33vw"
                      />
                    </div>
                  ) : null}
                  <div className="universe-card__overlay" />
                  <span className="universe-card__arrow"><ArrowUpRight size={16} /></span>
                  <div className="universe-card__content">
                    <small>UNIVERSE 0{index + 1}</small>
                    <h3>{franchise.name}</h3>
                    <p>{franchise.title_count || 0} connected titles</p>
                  </div>
                </Link>
              ))}
              {catalogue.franchises.length === 0 && !loading ? (
                <div className="empty-shelf">
                  Your connected universes will appear here.
                  <Link href="/franchises">Open the universe directory →</Link>
                </div>
              ) : null}
            </div>
          </section>

          <section className="discovery-banner">
            <div className="discovery-banner__icon"><Swords size={23} /></div>
            <div>
              <p className="eyebrow">YOUR NEXT DEEP DIVE</p>
              <h2>Follow a story beyond the screen.</h2>
              <p>Browse original works, adaptations and the stories connected to them.</p>
            </div>
            <Link href="/titles" className="secondary-button">
              Browse the catalogue <ArrowRight size={15} />
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
