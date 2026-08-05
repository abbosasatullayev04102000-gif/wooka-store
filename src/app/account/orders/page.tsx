import type { Metadata } from 'next'
import { OrderCard } from '@/components/account/OrderCard'
import { OrderTracker } from '@/components/account/OrderTracker'
import { ButtonLink } from '@/components/ui/Button'
import { getMyOrders } from '@/lib/db/orders'
import { buildMetadata } from '@/lib/utils/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildMetadata({
  title: 'Buyurtmalarim',
  path: '/account/orders',
  noIndex: true,
})

export default async function OrdersPage() {
  const orders = await getMyOrders().catch(() => [])

  if (!orders.length) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-dashed border-line-strong bg-white px-6 py-12 text-center">
          <p className="text-4xl" aria-hidden>
            📦
          </p>
          <p className="mt-3 font-semibold text-ink">Bu hisobda buyurtmalar yo‘q</p>
          <p className="mt-1 text-sm text-ink-muted">
            Mehmon sifatida buyurtma bergan bo‘lsangiz, quyidagi shakl orqali holatini tekshiring.
          </p>
          <ButtonLink href="/catalog" variant="primary" size="md" className="mt-4">
            Katalogga o‘tish
          </ButtonLink>
        </div>

        <OrderTracker />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}
