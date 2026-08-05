/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SCHEMA — wired to the REAL WOOKA Merchant database.
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  The admin dashboard (wooka.online) stores everything as one jsonb
 *  blob per record:
 *
 *      products(id text pk, data jsonb, deleted boolean, updated_at)
 *      categories / orders / customers — identical shape
 *
 *  Reading `data->>'...'` from the client would mean no type safety, no numeric
 *  sorting and no usable indexes. So `supabase/migrations/0001_store_views.sql`
 *  adds flattened, typed VIEWS and the storefront reads only those:
 *
 *      store_products    → id, name, slug, category_name, brand, price,
 *                          old_price, stock, rating, sales_count, sku, image,
 *                          emoji, description, status, discount_percent
 *      store_categories  → id (= name), name, slug, parent_name, emoji, image…
 *      store_brands      → derived from distinct products.data->>'brand'
 *
 *  Writes never touch a table directly — they go through place_order(), which
 *  produces an order row the admin dashboard already knows how to render.
 *
 *  ── Identity notes (these are the admin's rules, not ours) ──
 *  • products.id is a stringified integer  ("1", "2", …)
 *  • categories.id IS the category name    ("O'yinchoqlar")
 *    and children point at parents by name, not by id
 *  • orders.id is the printed check number ("#100001", storefront: "#500001"+)
 *  • customers.id is the phone number, falling back to the name
 */

// ── Views the storefront reads ──────────────────────────────────────────────
export const VIEWS = {
  products: 'store_products',
  categories: 'store_categories',
  brands: 'store_brands',
  settings: 'store_settings',
} as const

// ── Base tables (never queried directly by the storefront) ─────────────────
export const TABLES = {
  products: 'products',
  categories: 'categories',
  orders: 'orders',
  customers: 'customers',
} as const

export const RPC = {
  placeOrder: 'place_order',
  trackOrder: 'track_order',
  searchProducts: 'search_products',
} as const

export const SCHEMA_CONFIG = {
  /**
   * The merchant app has no reviews/banners/promotions tables — those arrays
   * live only in the browser's localStorage and are never synced. The
   * storefront degrades gracefully instead of erroring.
   */
  hasReviews: false,
  hasBanners: false,
  hasPromotions: false,
  /** Brands are derived from products.data->>'brand', so this is always on. */
  hasBrands: true,

  /** Public Storage bucket that product images move into. */
  storageBucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'wooka-media',

  /**
   * Until `tools/migrate-images.mjs` has run, products.data.img still holds
   * base64 data URLs written by the old admin build. Leave this true so those
   * products keep showing a picture; flip to false after the migration to make
   * any remaining inline image loudly fall back to the placeholder.
   */
  allowInlineBase64: false,

  /** Product statuses the admin uses. Only these reach the storefront. */
  visibleStatuses: ['active', 'out'] as const,
} as const

/** Columns selected from store_products — one place to change. */
export const PRODUCT_FIELDS = [
  'id',
  'name',
  'slug',
  'category_name',
  'brand',
  'price',
  'old_price',
  'stock',
  'rating',
  'sales_count',
  'sku',
  'image',
  'emoji',
  'description',
  'status',
  'discount_percent',
  'updated_at',
].join(',')

export const CATEGORY_FIELDS = [
  'id',
  'name',
  'slug',
  'name_ru',
  'parent_name',
  'emoji',
  'color',
  'image',
  'description',
  'product_count',
].join(',')

export const BRAND_FIELDS = ['id', 'name', 'slug', 'product_count'].join(',')

/** Sort key → (column, ascending) against store_products. */
export const SORT_COLUMNS: Record<string, { column: string; ascending: boolean }> = {
  popular: { column: 'sales_count', ascending: false },
  new: { column: 'updated_at', ascending: false },
  price_asc: { column: 'price', ascending: true },
  price_desc: { column: 'price', ascending: false },
  rating: { column: 'rating', ascending: false },
  discount: { column: 'discount_percent', ascending: false },
}
