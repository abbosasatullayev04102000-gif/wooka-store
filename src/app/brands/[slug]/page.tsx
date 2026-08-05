import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CatalogView } from '@/components/catalog/CatalogView'
import { getBrandBySlug, listBrands } from '@/lib/db/brands'
import { buildMetadata } from '@/lib/utils/seo'
import type { RawParams } from '@/lib/utils/searchParams'

export const revalidate = 300

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<RawParams>
}

export async function generateStaticParams() {
  const brands = await listBrands().catch(() => [])
  return brands.filter((b) => b.slug).map((b) => ({ slug: b.slug as string }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrandBySlug(slug).catch(() => null)
  if (!brand) return buildMetadata({ title: 'Brend topilmadi', path: `/brands/${slug}`, noIndex: true })

  return buildMetadata({
    title: `${brand.name} — barcha mahsulotlar`,
    description: brand.description || `${brand.name} brendi mahsulotlari WOOKA do‘konida.`,
    path: `/brands/${brand.slug ?? brand.id}`,
    image: brand.logo,
  })
}

export default async function BrandPage({ params, searchParams }: PageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const brand = await getBrandBySlug(slug).catch(() => null)
  if (!brand) notFound()

  return (
    <CatalogView
      title={brand.name}
      description={brand.description}
      basePath={`/brands/${brand.slug ?? brand.id}`}
      searchParams={sp}
      baseFilters={{ brandIds: [brand.id] }}
      emptyMessage={`${brand.name} brendida mahsulot topilmadi`}
    />
  )
}
