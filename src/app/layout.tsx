import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { ToastProvider } from '@/components/ui/Toast'
import { JsonLd } from '@/components/seo/JsonLd'
import { SITE_NAME, SITE_TAGLINE, SITE_URL, organisationJsonLd, websiteJsonLd } from '@/lib/utils/seo'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'WOOKA — O‘zbekistondagi bolalar o‘yinchoqlari do‘koni. Sifatli o‘yinchoqlar, konstruktorlar, rivojlantiruvchi to‘plamlar. Toshkent bo‘ylab 2 soatda yetkazib berish.',
  keywords: ['o‘yinchoq', 'bolalar o‘yinchoqlari', 'konstruktor', 'lego', 'WOOKA', 'Toshkent', 'o‘yinchoq do‘koni'],
  applicationName: SITE_NAME,
  formatDetection: { telephone: true },
  icons: { icon: '/favicon.svg', apple: '/img/apple-touch-icon.png' },
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#7C3AED',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        {/* Warm up the Supabase origin before the first product image request. */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="" />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
          </>
        )}
      </head>
      <body className="min-h-dvh">
        <JsonLd data={[organisationJsonLd(), websiteJsonLd()]} />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
        >
          Asosiy kontentga o‘tish
        </a>

        <ToastProvider>
          <Suspense fallback={<div className="h-[68px] border-b border-line bg-white lg:h-[125px]" />}>
            <Header />
          </Suspense>

          <main id="main" className="pb-16 lg:pb-0">
            {children}
          </main>

          <Footer />
          <MobileNav />
        </ToastProvider>
      </body>
    </html>
  )
}
