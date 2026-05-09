'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { Franchise } from '../types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function FranchisesPage() {
  const [franchises, setFranchises] = useState<Franchise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/franchises`)
      .then(r => r.json())
      .then(d => { setFranchises(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="font-syne text-4xl font-bold mb-2">All Franchises</h1>
        <p className="text-white/40 mb-8">Every connected universe on LoreZone</p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {franchises.map(f => (
              <Link
                key={f.id}
                href={`/franchise/${f.slug}`}
                className="group bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden hover:border-white/15 hover:-translate-y-1 transition-all duration-200"
              >
                <div className="h-28 bg-gradient-to-br from-[#e24b4a]/20 to-[#1a1a1a] flex items-center justify-center relative">
                  <span className="font-syne text-4xl font-bold text-white/10">{f.name.charAt(0)}</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
                </div>
                <div className="p-4">
                  <h3 className="font-syne font-bold text-base mb-1">{f.name}</h3>
                  <p className="text-xs text-white/40 line-clamp-2 mb-2">{f.description}</p>
                  <span className="text-xs text-white/25">{f.title_count || 0} titles</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
