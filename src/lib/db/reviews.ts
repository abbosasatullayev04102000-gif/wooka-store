import { SCHEMA_CONFIG } from './schema'
import type { Review } from './types'

/**
 * The WOOKA merchant app keeps a `reviews` array in the browser's localStorage
 * but never syncs it to Supabase (SB_TABLES = orders, products, categories,
 * customers). There is therefore no review data in the database at all.
 *
 * Rather than invent reviews, the storefront shows the rating the admin stores
 * on each product (`data->>'rate'`) and hides the review list. When a reviews
 * table is added later, implement it here — every call site already handles an
 * empty result.
 */

export function reviewsEnabled(): boolean {
  return SCHEMA_CONFIG.hasReviews
}

export async function getProductReviews(_productId: string, _limit = 30): Promise<Review[]> {
  return []
}

export async function getFeaturedReviews(_limit = 8): Promise<Review[]> {
  return []
}

export function reviewSummary(reviews: Review[]) {
  const total = reviews.length
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }))
  const average = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0
  return { total, average, breakdown }
}
