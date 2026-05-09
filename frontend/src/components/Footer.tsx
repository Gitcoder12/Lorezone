import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20 py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-syne text-xl font-bold">Lore<span className="text-[#e24b4a]">Zone</span></span>
          <p className="text-xs text-white/30 mt-1">Every universe. Connected.</p>
        </div>
        <div className="flex gap-6 text-sm text-white/30">
          <Link href="/franchises" className="hover:text-white transition">Franchises</Link>
          <Link href="/titles" className="hover:text-white transition">Titles</Link>
          <Link href="/search" className="hover:text-white transition">Search</Link>
          <a href="https://github.com/Gitcoder12/Lorezone" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub</a>
        </div>
        <p className="text-xs text-white/20">Built by Gitcoder12 · Data via Jikan/MAL</p>
      </div>
    </footer>
  )
}
