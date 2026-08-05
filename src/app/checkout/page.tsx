import type { Metadata } from 'next'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { getContactInfo } from '@/lib/db/content'
import { buildMetadata } from '@/lib/utils/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildMetadata({
  title: 'Buyurtmani rasmiylashtirish',
  path: '/checkout',
  noIndex: true,
})

export default async function CheckoutPage() {
  const contact = await getContactInfo().catch(() => null)

  return (
    <div className="container-page py-6">
      <h1 className="mb-5 text-xl font-bold text-ink sm:text-2xl">Buyurtmani rasmiylashtirish</h1>
      <CheckoutForm
        freeDeliveryFrom={contact?.freeDeliveryFrom ?? 300000}
        deliveryFee={contact?.deliveryFee ?? 25000}
        pickupAddress={contact?.address ?? "Toshkent sh., Amir Temur ko'chasi 1"}
      />
    </div>
  )
}
