import { unstable_cache } from 'next/cache'

export const CACHE_TAGS = {
  products: 'products',
  categories: 'categories',
  brands: 'brands',
  banners: 'banners',
  promotions: 'promotions',
  settings: 'settings',
  reviews: 'reviews',
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]

/** Catalogue data changes rarely; orders are never cached. */
export const REVALIDATE = {
  catalogue: 300, // 5 min
  product: 120,
  static: 3600,
} as const

/**
 * Wraps a data-loading function in the Next.js data cache with tags so the
 * admin dashboard can bust it on demand via POST /api/revalidate.
 */
export function cached<Args extends unknown[], T>(
  fn: (...args: Args) => Promise<T>,
  keyParts: string[],
  tags: CacheTag[],
  revalidate: number = REVALIDATE.catalogue,
) {
  return unstable_cache(fn, keyParts, { tags, revalidate })
}
