import type { MetadataRoute } from 'next'
import { listBrands } from '@/lib/db/brands'
import { listCategories } from '@/lib/db/categories'
import { getAllProductRefs } from '@/lib/db/products'
import { SITE_URL } from '@/lib/utils/seo'
import { slugify } from '@/lib/utils/slug'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/catalog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/promotions`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/brands`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ]

  const [categories, brands, products] = await Promise.all([
    listCategories().catch(() => []),
    listBrands().catch(() => []),
    getAllProductRefs(5000).catch(() => []),
  ])

  return [
    ...staticRoutes,
    ...categories.map((c) => ({
      url: `${SITE_URL}/c/${c.slug ?? c.id}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...brands.map((b) => ({
      url: `${SITE_URL}/brands/${b.slug ?? b.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/p/${p.slug || slugify(p.name)}-${p.id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
