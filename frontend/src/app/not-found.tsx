import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6">🎌</div>
      <h1 className="font-syne text-4xl font-bold mb-2">404</h1>
      <p className="text-white/40 mb-8">This page doesn't exist in any timeline.</p>
      <Link href="/" className="bg-[#e24b4a] hover:bg-[#c93e3d] transition px-6 py-3 rounded-full font-medium text-sm">
        Back to LoreZone
      </Link>
    </div>
  )
}
