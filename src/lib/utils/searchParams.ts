import type { ProductFilters, SortKey } from '@/lib/db/types'

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'popular', label: 'Ommaboplik bo‘yicha' },
  { value: 'new', label: 'Avval yangilari' },
  { value: 'price_asc', label: 'Avval arzonlari' },
  { value: 'price_desc', label: 'Avval qimmatlari' },
  { value: 'rating', label: 'Reyting bo‘yicha' },
  { value: 'discount', label: 'Chegirma bo‘yicha' },
]

const SORT_VALUES = new Set(SORT_OPTIONS.map((o) => o.value))

export type RawParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function list(value: string | string[] | undefined): string[] {
  if (!value) return []
  const raw = Array.isArray(value) ? value : [value]
  return raw.flatMap((v) => v.split(',')).map((v) => v.trim()).filter(Boolean)
}

function int(value: string | string[] | undefined): number | undefined {
  const n = Number(first(value))
  return Number.isFinite(n) ? n : undefined
}

/** Parses `?q=&sort=&minPrice=…` into the ProductFilters the data layer expects. */
export function parseFilters(params: RawParams, defaults: Partial<ProductFilters> = {}): ProductFilters {
  const sortRaw = first(params.sort) as SortKey | undefined
  return {
    ...defaults,
    query: first(params.q)?.trim() || defaults.query,
    brandIds: list(params.brand).length ? list(params.brand) : defaults.brandIds,
    minPrice: int(params.minPrice) ?? defaults.minPrice,
    maxPrice: int(params.maxPrice) ?? defaults.maxPrice,
    ageMin: int(params.ageMin) ?? defaults.ageMin,
    ageMax: int(params.ageMax) ?? defaults.ageMax,
    inStockOnly: first(params.inStock) === '1' ? true : defaults.inStockOnly,
    discountedOnly: first(params.discount) === '1' ? true : defaults.discountedOnly,
    sort: sortRaw && SORT_VALUES.has(sortRaw) ? sortRaw : (defaults.sort ?? 'popular'),
    page: Math.max(1, int(params.page) ?? 1),
    pageSize: defaults.pageSize,
  }
}

/** Immutable helper for building the next URL when a filter control changes. */
export function withParam(
  current: URLSearchParams,
  key: string,
  value: string | number | null | undefined,
): URLSearchParams {
  const next = new URLSearchParams(current.toString())
  if (value === null || value === undefined || value === '') next.delete(key)
  else next.set(key, String(value))
  if (key !== 'page') next.delete('page')
  return next
}

export function toggleListParam(current: URLSearchParams, key: string, value: string): URLSearchParams {
  const next = new URLSearchParams(current.toString())
  const existing = new Set((next.get(key) ?? '').split(',').filter(Boolean))
  if (existing.has(value)) existing.delete(value)
  else existing.add(value)
  if (existing.size) next.set(key, [...existing].join(','))
  else next.delete(key)
  next.delete('page')
  return next
}

export function countActiveFilters(params: RawParams): number {
  let n = 0
  if (first(params.minPrice) || first(params.maxPrice)) n++
  if (list(params.brand).length) n += list(params.brand).length
  if (first(params.inStock) === '1') n++
  if (first(params.discount) === '1') n++
  return n
}
