'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#0f0f0f]/90 backdrop-blur border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-syne text-2xl font-bold shrink-0">
          Lore<span className="text-[#e24b4a]">Zone</span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:flex">
          <div className="relative w-full">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search franchises, titles..."
              className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 pl-10 text-sm focus:outline-none focus:border-[#e24b4a]/50 placeholder-white/30"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          </div>
        </form>

        <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <Link href="/franchises" className="hover:text-white transition">Franchises</Link>
          <Link href="/titles" className="hover:text-white transition">Titles</Link>
          <Link href="/search" className="hover:text-white transition">Browse</Link>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white/60 hover:text-white">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#1a1a1a] border-t border-white/5 px-4 py-4 flex flex-col gap-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none"
            />
            <button type="submit" className="bg-[#e24b4a] rounded-full px-4 py-2 text-sm">Go</button>
          </form>
          <Link href="/franchises" className="text-white/70 hover:text-white" onClick={() => setMenuOpen(false)}>Franchises</Link>
          <Link href="/titles" className="text-white/70 hover:text-white" onClick={() => setMenuOpen(false)}>Titles</Link>
          <Link href="/search" className="text-white/70 hover:text-white" onClick={() => setMenuOpen(false)}>Browse</Link>
        </div>
      )}
    </nav>
  )
}
