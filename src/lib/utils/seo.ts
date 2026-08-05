import type { Metadata } from 'next'
import type { Product } from '@/lib/db/types'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://wookamarket.uz').replace(/\/$/, '')
export const SITE_NAME = 'WOOKA'
export const SITE_TAGLINE = 'Bolalar o‘yinchoq do‘koni'

export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

interface SeoInput {
  title: string
  description?: string
  path?: string
  image?: string | null
  noIndex?: boolean
  type?: 'website' | 'article'
}

export function buildMetadata({ title, description, path = '/', image, noIndex, type = 'website' }: SeoInput): Metadata {
  const url = absoluteUrl(path)
  const desc =
    description ||
    'WOOKA — O‘zbekistondagi bolalar o‘yinchoqlari do‘koni. Sifatli o‘yinchoqlar, konstruktorlar va rivojlantiruvchi to‘plamlar. Tez yetkazib berish.'
  const ogImage = image || absoluteUrl('/img/og-default.png')

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title,
      description: desc,
      locale: 'uz_UZ',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [ogImage],
    },
  }
}

// ── JSON-LD builders ────────────────────────────────────────────────────────

export function organisationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/img/logo.png'),
    sameAs: ['https://t.me/wooka_uz', 'https://instagram.com/wooka.uz'],
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function productJsonLd(product: Product, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description || product.name,
    image: product.images.map((i) => i.url).slice(0, 6),
    sku: product.sku || product.id,
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(product.reviewCount > 0 && product.rating > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating.toFixed(1),
            reviewCount: product.reviewCount,
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'UZS',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
