import type { Metadata } from 'next'
import { CartView } from '@/components/cart/CartView'
import { getContactInfo } from '@/lib/db/content'
import { buildMetadata } from '@/lib/utils/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Savat',
  description: 'WOOKA savatingiz — buyurtmani rasmiylashtirish.',
  path: '/cart',
  noIndex: true,
})

export default async function CartPage() {
  const contact = await getContactInfo().catch(() => null)
  return (
    <div className="container-page py-6">
      <h1 className="mb-5 text-xl font-bold text-ink sm:text-2xl">Savat</h1>
      <CartView freeDeliveryFrom={contact?.freeDeliveryFrom ?? 300000} deliveryFee={contact?.deliveryFee ?? 25000} />
    </div>
  )
}
