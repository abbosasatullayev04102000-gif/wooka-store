import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WOOKA — Bolalar o‘yinchoq do‘koni',
    short_name: 'WOOKA',
    description: 'O‘yinchoqlar, konstruktorlar va rivojlantiruvchi to‘plamlar. Tez yetkazib berish.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#7C3AED',
    lang: 'uz',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/img/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/img/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
