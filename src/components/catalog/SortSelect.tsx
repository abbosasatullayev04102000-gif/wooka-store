'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SORT_OPTIONS, withParam } from '@/lib/utils/searchParams'

export function SortSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const current = params.get('sort') ?? 'popular'

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-ink-muted sm:inline">Saralash:</span>
      <select
        value={current}
        onChange={(e) => router.push(`${pathname}?${withParam(params, 'sort', e.target.value).toString()}`, { scroll: false })}
        aria-label="Saralash"
        className="h-10 rounded-lg border border-line-strong bg-white px-3 pr-8 text-sm outline-none focus:border-brand-400"
        style={{
          appearance: 'none',
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B6880' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m5 9 7 7 7-7'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
