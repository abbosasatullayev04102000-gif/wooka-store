import type { Review } from '@/lib/db/types'
import { reviewSummary } from '@/lib/db/reviews'
import { formatDate, pluralise } from '@/lib/utils/format'
import { Rating } from '@/components/ui/Rating'

export function ReviewList({ reviews, rating, reviewCount }: { reviews: Review[]; rating: number; reviewCount: number }) {
  const summary = reviewSummary(reviews)
  const average = summary.total ? summary.average : rating
  const total = summary.total || reviewCount

  if (!total) {
    return (
      <div className="rounded-2xl border border-line bg-white p-6 text-center">
        <p className="text-sm text-ink-muted">Bu mahsulotga hali sharh yozilmagan.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 rounded-2xl border border-line bg-white p-5 lg:grid-cols-[240px_1fr]">
      <div className="lg:border-r lg:border-line lg:pr-6">
        <p className="text-4xl font-bold text-ink">{average.toFixed(1)}</p>
        <Rating value={average} size="md" showValue={false} className="mt-1" />
        <p className="mt-1 text-sm text-ink-muted">
          {total} {pluralise(total, ['sharh', 'sharh', 'sharh'])}
        </p>

        {summary.total > 0 && (
          <ul className="mt-4 space-y-1.5">
            {summary.breakdown.map((b) => (
              <li key={b.star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-ink-muted">{b.star}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                  <span
                    className="block h-full rounded-full bg-accent-500"
                    style={{ width: `${summary.total ? (b.count / summary.total) * 100 : 0}%` }}
                  />
                </span>
                <span className="w-6 text-right text-ink-faint">{b.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ul className="space-y-4">
        {reviews.slice(0, 10).map((r) => (
          <li key={r.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-ink">{r.authorName}</span>
              <span className="text-xs text-ink-faint">{formatDate(r.createdAt)}</span>
            </div>
            <Rating value={r.rating} size="xs" showValue={false} className="mt-1" />
            {r.body && <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{r.body}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
