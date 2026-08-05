import type { Review } from '@/lib/db/types'
import { formatDate } from '@/lib/utils/format'
import { Rating } from '@/components/ui/Rating'
import { Section } from './Section'

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null

  return (
    <Section title="Xaridorlar fikri">
      <ul className="rail -mx-3 px-3 sm:mx-0 sm:px-0">
        {reviews.slice(0, 10).map((r) => (
          <li
            key={r.id}
            className="flex w-[260px] shrink-0 flex-col gap-2 rounded-2xl border border-line bg-white p-4 sm:w-[300px]"
          >
            <Rating value={r.rating} size="sm" showValue={false} />
            <p className="line-clamp-2-safe text-sm text-ink" style={{ WebkitLineClamp: 4 }}>
              {r.body}
            </p>
            <p className="mt-auto flex items-center justify-between pt-2 text-xs text-ink-faint">
              <span className="font-medium text-ink-muted">{r.authorName}</span>
              <span>{formatDate(r.createdAt)}</span>
            </p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
