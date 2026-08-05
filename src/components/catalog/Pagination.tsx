import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { IconChevronLeft, IconChevronRight } from '@/components/ui/icons'

interface Props {
  page: number
  pageCount: number
  basePath: string
  searchParams: Record<string, string | string[] | undefined>
}

function hrefFor(basePath: string, searchParams: Props['searchParams'], page: number) {
  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([k, v]) => {
    if (k === 'page' || v === undefined) return
    params.set(k, Array.isArray(v) ? v.join(',') : v)
  })
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

/** Compact window: 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(page: number, pageCount: number): Array<number | '…'> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)
  const out: Array<number | '…'> = [1]
  const from = Math.max(2, page - 1)
  const to = Math.min(pageCount - 1, page + 1)
  if (from > 2) out.push('…')
  for (let i = from; i <= to; i++) out.push(i)
  if (to < pageCount - 1) out.push('…')
  out.push(pageCount)
  return out
}

export function Pagination({ page, pageCount, basePath, searchParams }: Props) {
  if (pageCount <= 1) return null

  const cellClass =
    'grid h-10 min-w-10 place-items-center rounded-lg border px-2.5 text-sm transition-colors'

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Sahifalar">
      <Link
        href={hrefFor(basePath, searchParams, Math.max(1, page - 1))}
        aria-label="Oldingi sahifa"
        aria-disabled={page === 1}
        className={cn(cellClass, page === 1 ? 'pointer-events-none border-line text-ink-faint' : 'border-line-strong hover:border-brand-400')}
      >
        <IconChevronLeft className="h-4 w-4" />
      </Link>

      {pageWindow(page, pageCount).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-ink-faint">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(basePath, searchParams, p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              cellClass,
              p === page ? 'border-brand-600 bg-brand-600 font-semibold text-white' : 'border-line-strong hover:border-brand-400',
            )}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        href={hrefFor(basePath, searchParams, Math.min(pageCount, page + 1))}
        aria-label="Keyingi sahifa"
        aria-disabled={page === pageCount}
        className={cn(
          cellClass,
          page === pageCount ? 'pointer-events-none border-line text-ink-faint' : 'border-line-strong hover:border-brand-400',
        )}
      >
        <IconChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  )
}
