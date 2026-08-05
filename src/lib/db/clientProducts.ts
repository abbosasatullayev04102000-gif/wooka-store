'use client'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { mapProduct } from './mappers'
import { PRODUCT_FIELDS, VIEWS } from './schema'
import type { Product } from './types'

/**
 * Client-side product lookup for wishlist and recently-viewed, whose id lists
 * live in localStorage and so cannot be resolved on the server. Reads the same
 * `store_products` view through the same anon key — no extra API.
 */
export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  const wanted = ids.filter(Boolean).slice(0, 60)
  if (!wanted.length) return []

  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.from(VIEWS.products).select(PRODUCT_FIELDS).in('id', wanted)
  if (error) throw error

  const byId = new Map((data ?? []).map((row: any) => [String(row.id), mapProduct(row)]))
  return wanted.map((id) => byId.get(id)).filter(Boolean) as Product[]
}
