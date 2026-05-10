'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Search, Menu, X, ChevronDown } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Suggestion {
  mal_id: number
  title: string
  title_english?: string
  type: string
  images?: { jpg: { image_url: string } }
  kind: 'anime' | 'manga'
}

export default function Navbar() {
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSug, setShowSug] = useState(false)
  const [browseOpen, setBrowseOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Autocomplete
  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (query.length < 2) { setSuggestions([]); setShowSug(false); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/live/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        const anime = (data.anime || []).slice(0, 4).map((a: Suggestion) => ({ ...a, kind: 'anime' }))
        const manga = (data.manga || []).slice(0, 3).map((m: Suggestion) => ({ ...m, kind: 'manga' }))
        setSuggestions([...anime, ...manga])
        setShowSug(true)
      } catch { }
    }, 350)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery(''); setShowSug(false)
    }
  }

  const pickSuggestion = (s: Suggestion) => {
    router.push(`/live/${s.kind}/${s.mal_id}`)
    setQuery(''); setShowSug(false)
  }

  const navLinks = [
    { href: '/browse', label: 'Browse' },
    { href: '/upcoming', label: 'Upcoming' },
    { href: '/schedule', label: 'Schedule' },
    { href: '/authors', label: 'Creators' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-[#0f0f0f]/90 backdrop-blur border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="font-syne text-2xl font-bold shrink-0 mr-2">
          Lore<span className="text-[#e24b4a]">Zone</span>
        </Link>

        {/* Search */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSug(true)}
                onBlur={() => setTimeout(() => setShowSug(false), 150)}
                placeholder="Search anime, manga, creators..."
                className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 pl-10 text-sm focus:outline-none focus:border-[#e24b4a]/50 placeholder-white/25 transition"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            </div>
          </form>

          {/* Suggestions dropdown */}
          {showSug && suggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onMouseDown={() => pickSuggestion(s)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 text-left transition"
                >
                  {s.images?.jpg?.image_url && (
                    <img src={s.images.jpg.image_url} alt="" className="w-8 h-10 object-cover rounded shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{s.title_english || s.title}</p>
                    <p className="text-[10px] text-white/30 capitalize">{s.kind} · {s.type}</p>
                  </div>
                </button>
              ))}
              <button
                onMouseDown={() => { router.push(`/search?q=${encodeURIComponent(query)}`); setQuery(''); setShowSug(false) }}
                className="w-full px-3 py-2 text-xs text-[#e24b4a] hover:bg-white/5 text-left border-t border-white/5"
              >
                See all results for "{query}" →
              </button>
            </div>
          )}
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1 ml-auto">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                pathname === l.href ? 'text-white bg-white/5' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden ml-auto text-white/60 hover:text-white">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#1a1a1a] border-t border-white/5 px-4 py-4 flex flex-col gap-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none"
            />
            <button type="submit" className="bg-[#e24b4a] rounded-full px-4 py-2 text-sm">Go</button>
          </form>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="text-white/60 hover:text-white py-1" onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
