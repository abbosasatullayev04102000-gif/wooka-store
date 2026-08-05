import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { listBrands } from '@/lib/db/brands'
import { brandHref } from '@/lib/utils/slug'
import { buildMetadata } from '@/lib/utils/seo'

export const revalidate = 600

export const metadata: Metadata = buildMetadata({
  title: 'Brendlar',
  description: 'WOOKA do‘konida sotiladigan o‘yinchoq brendlari.',
  path: '/brands',
})

export default async function BrandsPage() {
  const brands = await listBrands().catch(() => [])

  return (
    <div className="container-page py-6">
      <h1 className="text-xl font-bold text-ink sm:text-2xl">Brendlar</h1>

      {!brands.length ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line-strong bg-white p-8 text-center text-sm text-ink-muted">
          Brendlar ro‘yxati hali to‘ldirilmagan.
        </p>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {brands.map((brand) => (
            <li key={brand.id}>
              <Link
                href={brandHref(brand)}
                className="flex h-full flex-col items-center gap-2 rounded-2xl border border-line bg-white p-4 text-center transition-all hover:border-brand-300 hover:shadow-card"
              >
                <span className="grid h-16 w-full place-items-center">
                  {brand.logo ? (
                    <Image src={brand.logo} alt={brand.name} width={96} height={64} className="max-h-16 w-auto object-contain" />
                  ) : (
                    <span className="text-lg font-bold text-brand-600">{brand.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </span>
                <span className="text-sm font-medium text-ink">{brand.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
