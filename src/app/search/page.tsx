import type { Metadata } from 'next'
import { CatalogView } from '@/components/catalog/CatalogView'
import { buildMetadata } from '@/lib/utils/seo'
import type { RawParams } from '@/lib/utils/searchParams'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<RawParams>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q : ''
  return buildMetadata({
    title: q ? `“${q}” bo‘yicha qidiruv` : 'Qidiruv',
    description: q ? `“${q}” so‘rovi bo‘yicha WOOKA do‘konidagi mahsulotlar.` : 'WOOKA do‘konida mahsulot qidirish.',
    path: '/search',
    // Search result pages should not compete with category pages in the index.
    noIndex: true,
  })
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q.trim() : ''

  return (
    <CatalogView
      title={q ? `“${q}” bo‘yicha natijalar` : 'Barcha mahsulotlar'}
      basePath="/search"
      searchParams={sp}
      emptyMessage={q ? `“${q}” bo‘yicha hech narsa topilmadi` : 'Mahsulot topilmadi'}
    />
  )
}
