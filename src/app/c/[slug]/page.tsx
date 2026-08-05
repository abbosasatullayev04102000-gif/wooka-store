import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CatalogView } from '@/components/catalog/CatalogView'
import { JsonLd } from '@/components/seo/JsonLd'
import { getCategoryBranchIds, getCategoryBySlug, getCategoryPath, listCategories } from '@/lib/db/categories'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/utils/seo'
import { categoryHref } from '@/lib/utils/slug'
import type { RawParams } from '@/lib/utils/searchParams'

export const revalidate = 300

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<RawParams>
}

export async function generateStaticParams() {
  const categories = await listCategories().catch(() => [])
  return categories.filter((c) => c.slug).slice(0, 100).map((c) => ({ slug: c.slug as string }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug).catch(() => null)
  if (!category) return buildMetadata({ title: 'Kategoriya topilmadi', path: `/c/${slug}`, noIndex: true })

  return buildMetadata({
    title: `${category.name} — WOOKA`,
    description:
      category.description ||
      `${category.name} kategoriyasidagi mahsulotlar. Sifatli o‘yinchoqlar, qulay narxlar, tez yetkazib berish.`,
    path: `/c/${category.slug ?? category.id}`,
    image: category.image,
  })
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const category = await getCategoryBySlug(slug).catch(() => null)
  if (!category) notFound()

  const [branchIds, path, allCategories] = await Promise.all([
    getCategoryBranchIds(category.id),
    getCategoryPath(category.id),
    listCategories().catch(() => []),
  ])

  const children = allCategories.filter((c) => c.parentId === category.id)

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Bosh sahifa', path: '/' },
          { name: 'Katalog', path: '/catalog' },
          ...path.map((c) => ({ name: c.name, path: `/c/${c.slug ?? c.id}` })),
        ])}
      />

      <div className="container-page pt-4">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
          <Link href="/" className="hover:text-brand-700">
            Bosh sahifa
          </Link>
          <span aria-hidden>/</span>
          <Link href="/catalog" className="hover:text-brand-700">
            Katalog
          </Link>
          {path.map((c) => (
            <span key={c.id} className="flex items-center gap-1.5">
              <span aria-hidden>/</span>
              <Link href={categoryHref(c)} className="hover:text-brand-700">
                {c.name}
              </Link>
            </span>
          ))}
        </nav>
      </div>

      <CatalogView
        title={category.name}
        description={category.description}
        basePath={`/c/${category.slug ?? category.id}`}
        searchParams={sp}
        baseFilters={{ categoryIds: branchIds }}
        emptyMessage="Bu kategoriyada mahsulot topilmadi"
      >
        {children.length > 0 && (
          <ul className="mb-5 rail -mx-3 px-3 sm:mx-0 sm:px-0">
            {children.map((c) => (
              <li key={c.id}>
                <Link
                  href={categoryHref(c)}
                  className="inline-flex h-9 items-center whitespace-nowrap rounded-lg border border-line bg-white px-3.5 text-[13px] font-medium text-ink transition-colors hover:border-brand-300 hover:text-brand-700"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CatalogView>
    </>
  )
}
