'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowUpRight, Menu, Search, Sparkles, X } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Suggestion {
  mal_id: number
  title: string
  title_english?: string
  type?: string
  images?: { jpg?: { image_url?: string }; webp?: { image_url?: string } }
  kind: 'anime' | 'manga'
}

const links = [
  { href: '/browse/anime', label: 'Anime' },
  { href: '/browse/manga', label: 'Manga' },
  { href: '/franchises', label: 'Universes' },
  { href: '/schedule', label: 'Schedule' },
]

export default function Navbar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSuggestions(false)
        inputRef.current?.blur()
        return
      }

      if (
        event.key !== '/' ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) return

      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      ) return

      event.preventDefault()
      inputRef.current?.focus()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (requestRef.current) requestRef.current.abort()

    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController()
      requestRef.current = controller
      try {
        const response = await fetch(
          `${API}/api/live/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        )
        if (!response.ok) throw new Error('Search request failed')
        const data = await response.json()
        const anime = (data.anime || []).slice(0, 4).map((item: Omit<Suggestion, 'kind'>) => ({
          ...item,
          kind: 'anime' as const,
        }))
        const manga = (data.manga || []).slice(0, 3).map((item: Omit<Suggestion, 'kind'>) => ({
          ...item,
          kind: 'manga' as const,
        }))
        setSuggestions([...anime, ...manga])
        setShowSuggestions(true)
      } catch (error) {
        if (!(error instanceof Error && error.name === 'AbortError')) {
          setSuggestions([])
          setShowSuggestions(false)
        }
      }
    }, 280)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (requestRef.current) requestRef.current.abort()
    }
  }, [query])

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    setMenuOpen(false)
  }

  const chooseSuggestion = (item: Suggestion) => {
    router.push(`/live/${item.kind}/${item.mal_id}`)
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    setMenuOpen(false)
  }

  const active = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand-mark" aria-label="LoreZone home">
          <span className="brand-mark__symbol">L</span>
          <span className="brand-mark__word">LORE<span>ZONE</span></span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(link => (
            <Link key={link.href} href={link.href} className={active(link.href) ? 'is-active' : ''}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-search-wrap">
          <form className="header-search" onSubmit={submitSearch} role="search">
            <Search size={16} aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={event => setQuery(event.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => window.setTimeout(() => setShowSuggestions(false), 160)}
              placeholder="Find a story, world, creator..."
              aria-label="Search LoreZone"
              aria-expanded={showSuggestions && suggestions.length > 0}
              aria-controls="lorezone-search-suggestions"
            />
            <kbd aria-label="Press slash to focus search">/</kbd>
          </form>

          {showSuggestions && suggestions.length > 0 ? (
            <div className="search-popover" id="lorezone-search-suggestions">
              <p className="search-popover__label">QUICK DISCOVERY</p>
              {suggestions.map(item => {
                const image = item.images?.webp?.image_url || item.images?.jpg?.image_url
                return (
                  <button
                    type="button"
                    key={`${item.kind}-${item.mal_id}`}
                    onMouseDown={event => event.preventDefault()}
                    onClick={() => chooseSuggestion(item)}
                    className="search-suggestion"
                  >
                    <span className="search-suggestion__image">
                      {image ? (
                        <Image src={image} alt="" fill sizes="42px" />
                      ) : (
                        <Sparkles size={16} />
                      )}
                    </span>
                    <span className="search-suggestion__copy">
                      <strong>{item.title_english || item.title}</strong>
                      <small>{item.kind} · {item.type || 'Catalogue entry'}</small>
                    </span>
                    <ArrowUpRight size={15} />
                  </button>
                )
              })}
              <button
                type="button"
                className="search-popover__all"
                onMouseDown={event => event.preventDefault()}
                onClick={() => {
                  const trimmed = query.trim()
                  if (!trimmed) return
                  router.push(`/search?q=${encodeURIComponent(trimmed)}`)
                  setQuery('')
                  setSuggestions([])
                  setShowSuggestions(false)
                }}
              >
                See every result for “{query.trim()}” <span>↗</span>
              </button>
            </div>
          ) : null}
        </div>

        <Link href="/franchises" className="header-cta">
          Explore worlds <ArrowUpRight size={15} />
        </Link>

        <button
          type="button"
          className="mobile-menu-button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(open => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {menuOpen ? (
        <div className="mobile-nav">
          <form className="mobile-nav__search" onSubmit={submitSearch}>
            <Search size={17} />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search the storyverse..."
              aria-label="Search LoreZone"
            />
            <button type="submit">Search</button>
          </form>
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={active(link.href) ? 'is-active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}<ArrowUpRight size={16} />
            </Link>
          ))}
          <Link href="/franchises" className="mobile-nav__feature" onClick={() => setMenuOpen(false)}>
            Explore connected universes <span>↗</span>
          </Link>
        </div>
      ) : null}
    </header>
  )
}
