import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CatalogView } from '@/components/catalog/CatalogView'
import { listPromotions } from '@/lib/db/content'
import { buildMetadata } from '@/lib/utils/seo'
import { formatDate } from '@/lib/utils/format'
import type { RawParams } from '@/lib/utils/searchParams'

export const revalidate = 300

export const metadata: Metadata = buildMetadata({
  title: 'Aksiyalar va chegirmalar',
  description: 'WOOKA do‘konidagi joriy aksiyalar va chegirmadagi o‘yinchoqlar.',
  path: '/promotions',
})

export default async function PromotionsPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const [sp, promotions] = await Promise.all([searchParams, listPromotions().catch(() => [])])

  return (
    <CatalogView
      title="Aksiyalar va chegirmalar"
      description="Chegirmadagi barcha mahsulotlar bir joyda. Aksiya muddati tugashidan oldin ulguring."
      basePath="/promotions"
      searchParams={sp}
      baseFilters={{ discountedOnly: true, sort: 'discount' }}
      emptyMessage="Hozircha chegirmadagi mahsulot yo‘q"
    >
      {promotions.length > 0 && (
        <ul className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promo) => (
            <li key={promo.id}>
              <Link
                href={`/search?discount=1&q=${encodeURIComponent(promo.title)}`}
                className="group flex h-full gap-3 overflow-hidden rounded-2xl border border-line bg-white p-3 transition-shadow hover:shadow-card-hover"
              >
                <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-soft">
                  {promo.image ? (
                    <Image src={promo.image} alt="" fill sizes="80px" className="object-cover" />
                  ) : (
                    <span className="grid h-full place-items-center text-2xl" aria-hidden>
                      🎁
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="line-clamp-2-safe font-semibold text-ink group-hover:text-brand-700">
                      {promo.title}
                    </span>
                    {promo.discountPercent ? (
                      <span className="shrink-0 rounded-md bg-danger px-1.5 py-0.5 text-[11px] font-bold text-white">
                        −{promo.discountPercent}%
                      </span>
                    ) : null}
                  </span>
                  {promo.description && (
                    <span className="line-clamp-2-safe mt-1 block text-xs text-ink-muted">{promo.description}</span>
                  )}
                  {promo.endsAt && (
                    <span className="mt-1 block text-[11px] text-ink-faint">{formatDate(promo.endsAt)} gacha</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CatalogView>
  )
}
