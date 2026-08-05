import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getCategoryTree } from '@/lib/db/categories'
import { categoryHref } from '@/lib/utils/slug'
import { buildMetadata } from '@/lib/utils/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd } from '@/lib/utils/seo'

export const revalidate = 600

export const metadata: Metadata = buildMetadata({
  title: 'Katalog — barcha kategoriyalar',
  description: 'WOOKA katalogi: o‘yinchoqlar, konstruktorlar, rivojlantiruvchi to‘plamlar, maktab anjomlari va boshqalar.',
  path: '/catalog',
})

export default async function CatalogPage() {
  const tree = await getCategoryTree().catch(() => [])

  return (
    <div className="container-page py-6">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Bosh sahifa', path: '/' }, { name: 'Katalog', path: '/catalog' }])} />

      <h1 className="text-xl font-bold text-ink sm:text-2xl">Katalog</h1>

      {!tree.length ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line-strong bg-white p-8 text-center text-sm text-ink-muted">
          Kategoriyalar hali qo‘shilmagan.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tree.map((cat) => (
            <section key={cat.id} className="rounded-2xl border border-line bg-white p-4">
              <Link href={categoryHref(cat)} className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface-soft">
                  {cat.image ? (
                    <Image src={cat.image} alt="" width={48} height={48} className="h-12 w-12 object-contain" />
                  ) : (
                    <span aria-hidden className="text-xl">
                      🧸
                    </span>
                  )}
                </span>
                <h2 className="font-semibold text-ink hover:text-brand-700">{cat.name}</h2>
              </Link>

              {cat.children?.length ? (
                <ul className="mt-3 space-y-1.5">
                  {cat.children.slice(0, 8).map((child) => (
                    <li key={child.id}>
                      <Link href={categoryHref(child)} className="text-sm text-ink-muted hover:text-brand-700">
                        {child.name}
                      </Link>
                    </li>
                  ))}
                  {cat.children.length > 8 && (
                    <li>
                      <Link href={categoryHref(cat)} className="text-sm font-medium text-brand-700 hover:underline">
                        Yana {cat.children.length - 8} ta
                      </Link>
                    </li>
                  )}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
