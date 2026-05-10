/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.myanimelist.net' },
      { protocol: 'https', hostname: 'cdn.anilist.co' },
      { protocol: 'https', hostname: 's4.anilist.co' },
      { protocol: 'https', hostname: 'img1.ak.crunchyroll.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'media.kitsu.io' },
      { protocol: 'https', hostname: 'localhost' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/browse',
        destination: '/browse/anime',
      },
    ]
  },
}
module.exports = nextConfig
