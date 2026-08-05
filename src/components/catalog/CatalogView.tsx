import Link from 'next/link'
import { listBrands } from '@/lib/db/brands'
import { getPriceBounds, listProducts } from '@/lib/db/products'
import type { ProductFilters } from '@/lib/db/types'
import { pluralise } from '@/lib/utils/format'
import { countActiveFilters, parseFilters, type RawParams } from '@/lib/utils/searchParams'
import { ProductGrid } from '@/components/home/Section'
import { FilterPanel } from './FilterPanel'
import { Pagination } from './Pagination'
import { SortSelect } from './SortSelect'

interface Props {
  title: string
  basePath: string
  searchParams: RawParams
  /** Filters forced by the route (category, brand, discounts-only …). */
  baseFilters?: Partial<ProductFilters>
  description?: string | null
  emptyMessage?: string
  children?: React.ReactNode
}

export async function CatalogView({
  title,
  basePath,
  searchParams,
  baseFilters = {},
  description,
  emptyMessage,
  children,
}: Props) {
  const filters = parseFilters(searchParams, { ...baseFilters, pageSize: 24 })

  const [result, brands, priceBounds] = await Promise.all([
    listProducts(filters).catch(() => ({ items: [], total: 0, page: 1, pageSize: 24, pageCount: 1 })),
    listBrands().catch(() => []),
    getPriceBounds({ ...baseFilters, query: filters.query }).catch(() => ({ min: 0, max: 0 })),
  ])

  const activeCount = countActiveFilters(searchParams)

  return (
    <div className="container-page py-5">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-ink sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-sm text-ink-muted">{description}</p>}
        <p className="mt-1 text-sm text-ink-faint">
          {result.total} {pluralise(result.total, ['mahsulot', 'mahsulot', 'mahsulot'])} topildi
        </p>
      </div>

      {children}

      <div className="flex gap-6">
        <FilterPanel brands={brands} priceBounds={priceBounds} activeCount={activeCount} />

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="lg:hidden">
              {/* Mobile filter trigger lives inside FilterPanel; keep spacing consistent. */}
            </div>
            <div className="ml-auto">
              <SortSelect />
            </div>
          </div>

          {result.items.length ? (
            <>
              <ProductGrid products={result.items} className="lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" />
              <Pagination
                page={result.page}
                pageCount={result.pageCount}
                basePath={basePath}
                searchParams={searchParams as Record<string, string | string[] | undefined>}
              />
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-line-strong bg-white px-6 py-16 text-center">
              <p className="text-3xl" aria-hidden>
                🔍
              </p>
              <p className="mt-3 font-semibold text-ink">{emptyMessage ?? 'Hech narsa topilmadi'}</p>
              <p className="mt-1 text-sm text-ink-muted">
                Filtrlarni o‘zgartirib ko‘ring yoki{' '}
                <Link href="/catalog" className="font-medium text-brand-700 hover:underline">
                  butun katalogni ko‘ring
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
