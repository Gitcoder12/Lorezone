import Link from 'next/link'
import { ArrowUpRight, Github, Sparkles } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__main">
        <div className="site-footer__brand">
          <Link href="/" className="brand-mark" aria-label="LoreZone home">
            <span className="brand-mark__symbol">L</span>
            <span className="brand-mark__word">LORE<span>ZONE</span></span>
          </Link>
          <p>Every world has a story.<br />Every story has a place.</p>
        </div>

        <div className="site-footer__links">
          <div>
            <span className="site-footer__label">DISCOVER</span>
            <Link href="/browse/anime">Anime</Link>
            <Link href="/browse/manga">Manga</Link>
            <Link href="/franchises">Universes</Link>
          </div>
          <div>
            <span className="site-footer__label">EXPLORE</span>
            <Link href="/titles">All titles</Link>
            <Link href="/schedule">Release schedule</Link>
            <Link href="/search">Search catalogue</Link>
          </div>
        </div>

        <a
          className="site-footer__github"
          href="https://github.com/Gitcoder12/Lorezone"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github size={17} /> View the project <ArrowUpRight size={15} />
        </a>
      </div>

      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} LoreZone. Built for the curious.</span>
        <span><Sparkles size={13} /> Catalogue data by Jikan & AniList</span>
      </div>
    </footer>
  )
}
