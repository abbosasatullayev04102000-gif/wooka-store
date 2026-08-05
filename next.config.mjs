/** @type {import('next').NextConfig} */

// Derive the Supabase storage hostname from the project URL so <Image> can
// optimise product photos served straight out of Supabase Storage.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
let supabaseHost = ''
try {
  supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : ''
} catch {
  supabaseHost = ''
}

const remotePatterns = [
  // Any Supabase project storage bucket (covers self-hosted + cloud).
  { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
  { protocol: 'https', hostname: '*.supabase.in', pathname: '/storage/v1/object/public/**' },
]

if (supabaseHost && !remotePatterns.some((p) => p.hostname === supabaseHost)) {
  remotePatterns.push({ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' })
}

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    remotePatterns,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 176, 240, 320, 420],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },

  experimental: {
    optimizePackageImports: ['embla-carousel-react'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
      {
        // Static product imagery is immutable — cache hard at the edge.
        source: '/_next/image',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, s-maxage=604800, stale-while-revalidate=86400' }],
      },
    ]
  },
}

export default nextConfig
