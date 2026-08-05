import { getSupabasePublicClient } from '@/lib/supabase/server'
import { CACHE_TAGS, cached } from './cache'
import { mapBrand } from './mappers'
import { BRAND_FIELDS, VIEWS } from './schema'
import type { Brand } from './types'

/**
 * The merchant app has no brands table — `store_brands` is a view over the
 * distinct `products.data->>'brand'` values, so a brand appears the moment a
 * product is tagged with it in the dashboard.
 */
async function listBrandsUncached(): Promise<Brand[]> {
  const supabase = getSupabasePublicClient()
  const { data, error } = await supabase.from(VIEWS.brands).select(BRAND_FIELDS)
  if (error) {
    if (process.env.NODE_ENV !== 'production') console.warn('[brands.list]', error.message)
    return []
  }
  return (data ?? []).map(mapBrand)
}

export const listBrands = cached(listBrandsUncached, ['brands:all'], [CACHE_TAGS.brands])

export async function getBrandBySlug(slugOrId: string): Promise<Brand | null> {
  const all = await listBrands()
  const decoded = decodeURIComponent(slugOrId)
  return (
    all.find((b) => b.slug === slugOrId) ??
    all.find((b) => b.id === decoded) ??
    all.find((b) => b.name.toLowerCase() === decoded.toLowerCase()) ??
    null
  )
}
