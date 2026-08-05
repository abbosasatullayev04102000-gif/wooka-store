import type { Metadata } from 'next'
import { WishlistView } from '@/components/wishlist/WishlistView'
import { buildMetadata } from '@/lib/utils/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Sevimlilar',
  description: 'Saqlab qo‘yilgan mahsulotlaringiz.',
  path: '/wishlist',
  noIndex: true,
})

export default function WishlistPage() {
  return (
    <div className="container-page py-6">
      <h1 className="mb-5 text-xl font-bold text-ink sm:text-2xl">Sevimlilar</h1>
      <WishlistView />
    </div>
  )
}
