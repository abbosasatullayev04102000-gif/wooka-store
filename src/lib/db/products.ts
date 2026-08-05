import { getSupabasePublicClient } from '@/lib/supabase/server'
import { CACHE_TAGS, REVALIDATE, cached } from './cache'
import { mapProduct } from './mappers'
import { PRODUCT_FIELDS, SORT_COLUMNS, VIEWS } from './schema'
import type { Paginated, Product, ProductFilters, SortKey } from './types'

export const DEFAULT_PAGE_SIZE = 24

function applyFilters(q: any, f: ProductFilters) {
  if (f.categoryId) q = q.eq('category_name', f.categoryId)
  if (f.categoryIds?.length) q = q.in('category_name', f.categoryIds)
  if (f.brandIds?.length) q = q.in('brand', f.brandIds)

  if (typeof f.minPrice === 'number') q = q.gte('price', f.minPrice)
  if (typeof f.maxPrice === 'number') q = q.lte('price', f.maxPrice)

  if (f.inStockOnly) q = q.gt('stock', 0)
  if (f.discountedOnly) q = q.gt('discount_percent', 0)

  if (f.query?.trim()) {
    // Commas and parentheses are PostgREST `or()` separators — strip them.
    const term = f.query.trim().replace(/[%,()]/g, ' ')
    q = q.or([`name.ilike.%${term}%`, `brand.ilike.%${term}%`, `sku.ilike.%${term}%`].join(','))
  }

  return q
}

function applySort(q: any, sort: SortKey = 'popular') {
  const spec = SORT_COLUMNS[sort] ?? SORT_COLUMNS.popular
  q = q.order(spec.column, { ascending: spec.ascending, nullsFirst: false })
  // Deterministic tiebreaker, otherwise pagination can repeat or skip rows.
  return q.order('id', { ascending: true })
}

async function listProductsUncached(filters: ProductFilters = {}): Promise<Paginated<Product>> {
  const supabase = getSupabasePublicClient()
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(60, Math.max(1, filters.pageSize ?? DEFAULT_PAGE_SIZE))
  const from = (page - 1) * pageSize

  let q = supabase.from(VIEWS.products).select(PRODUCT_FIELDS, { count: 'exact' })
  q = applyFilters(q, filters)
  q = applySort(q, filters.sort)
  q = q.range(from, from + pageSize - 1)

  const { data, error, count } = await q
  if (error) throw new Error(`[products.list] ${error.message}`)

  const total = count ?? 0
  return {
    items: (data ?? []).map(mapProduct),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export const listProducts = cached(listProductsUncached, ['products:list'], [CACHE_TAGS.products])
export const searchProductsLive = listProductsUncached

async function getProductByIdUncached(id: string): Promise<Product | null> {
  const supabase = getSupabasePublicClient()
  const { data, error } = await supabase.from(VIEWS.products).select(PRODUCT_FIELDS).eq('id', id).limit(1)
  if (error) throw new Error(`[products.getById] ${error.message}`)
  const row = (data ?? [])[0]
  return row ? mapProduct(row) : null
}

export const getProductById = cached(getProductByIdUncached, ['products:byId'], [CACHE_TAGS.products], REVALIDATE.product)

async function getProductBySlugUncached(slug: string): Promise<Product | null> {
  const supabase = getSupabasePublicClient()
  const { data, error } = await supabase.from(VIEWS.products).select(PRODUCT_FIELDS).eq('slug', slug).limit(1)
  if (error) throw new Error(`[products.getBySlug] ${error.message}`)
  const row = (data ?? [])[0]
  return row ? mapProduct(row) : null
}

export const getProductBySlug = cached(
  getProductBySlugUncached,
  ['products:bySlug'],
  [CACHE_TAGS.products],
  REVALIDATE.product,
)

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return []
  const supabase = getSupabasePublicClient()
  const { data, error } = await supabase.from(VIEWS.products).select(PRODUCT_FIELDS).in('id', ids.slice(0, 50))
  if (error) throw new Error(`[products.byIds] ${error.message}`)
  const byId = new Map((data ?? []).map((r: any) => [String(r.id), mapProduct(r)]))
  return ids.map((id) => byId.get(id)).filter(Boolean) as Product[]
}

// ── Homepage rails ──────────────────────────────────────────────────────────

const rail = (key: string, filters: ProductFilters) =>
  cached(
    () => listProductsUncached(filters).then((r) => r.items),
    ['products:rail', key, String(filters.pageSize ?? 12)],
    [CACHE_TAGS.products],
  )

export const getNewArrivals = (limit = 12) => rail('new', { sort: 'new', pageSize: limit, inStockOnly: true })()
export const getBestSellers = (limit = 12) => rail('best', { sort: 'popular', pageSize: limit, inStockOnly: true })()
export const getDiscounted = (limit = 12) =>
  rail('discount', { sort: 'discount', discountedOnly: true, pageSize: limit, inStockOnly: true })()

/**
 * The merchant app has no "featured" flag, so recommendations are the
 * best-rated in-stock products, falling back to the most popular.
 */
export const getRecommended = (limit = 12) =>
  cached(
    async () => {
      const rated = await listProductsUncached({ sort: 'rating', pageSize: limit, inStockOnly: true })
      if (rated.items.length >= Math.min(4, limit)) return rated.items
      return (await listProductsUncached({ sort: 'popular', pageSize: limit })).items
    },
    ['products:recommended', String(limit)],
    [CACHE_TAGS.products],
  )()

export async function getSimilarProducts(product: Product, limit = 12): Promise<Product[]> {
  if (!product.categoryId) {
    const fallback = await listProducts({ sort: 'popular', pageSize: limit + 1 })
    return fallback.items.filter((p) => p.id !== product.id).slice(0, limit)
  }
  const res = await listProducts({ categoryId: product.categoryId, pageSize: limit + 1, sort: 'popular' })
  return res.items.filter((p) => p.id !== product.id).slice(0, limit)
}

/** Min/max price within a result set — drives the price filter bounds. */
export async function getPriceBounds(filters: Omit<ProductFilters, 'minPrice' | 'maxPrice' | 'page'> = {}) {
  const supabase = getSupabasePublicClient()

  const build = (asc: boolean) => {
    let q = supabase.from(VIEWS.products).select('price').order('price', { ascending: asc }).limit(1)
    return applyFilters(q, { ...filters, minPrice: undefined, maxPrice: undefined })
  }

  const [lo, hi] = await Promise.all([build(true), build(false)])
  const min = Number((lo.data as any[])?.[0]?.price ?? 0)
  const max = Number((hi.data as any[])?.[0]?.price ?? 0)
  return { min: Number.isFinite(min) ? min : 0, max: Number.isFinite(max) ? max : 0 }
}

/** Every product id + slug, for the sitemap. */
export async function getAllProductRefs(limit = 5000) {
  const supabase = getSupabasePublicClient()
  const { data, error } = await supabase.from(VIEWS.products).select('id,slug,name,updated_at').limit(limit)
  if (error) return []
  return (data ?? []).map((r: any) => ({
    id: String(r.id),
    slug: r.slug ? String(r.slug) : null,
    name: String(r.name ?? ''),
    updatedAt: r.updated_at ? String(r.updated_at) : null,
  }))
}
