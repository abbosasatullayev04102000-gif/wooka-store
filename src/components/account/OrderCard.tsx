import Link from 'next/link'
import type { Order } from '@/lib/db/types'
import { DELIVERY_METHOD_LABELS, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/db/orderLabels'
import { paymentLabel } from '@/lib/payments'
import { formatDateTime, formatPrice } from '@/lib/utils/format'
import { ProductThumb } from '@/components/product/ProductThumb'
import { cn } from '@/lib/utils/cn'

const TONE_CLASS: Record<string, string> = {
  neutral: 'bg-surface-sunken text-ink-muted',
  info: 'bg-brand-50 text-brand-700',
  success: 'bg-green-50 text-success',
  danger: 'bg-red-50 text-danger',
}

export function OrderCard({ order }: { order: Order }) {
  const status = ORDER_STATUS_LABELS[order.status] ?? { label: order.status, tone: 'neutral' as const }

  return (
    <article className="rounded-2xl border border-line bg-white p-5">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h3 className="font-semibold text-ink">№ {order.orderNumber}</h3>
          <p className="text-xs text-ink-faint">{formatDateTime(order.createdAt)}</p>
        </div>
        <span className={cn('rounded-lg px-2.5 py-1 text-xs font-medium', TONE_CLASS[status.tone])}>{status.label}</span>
      </header>

      <ul className="my-4 space-y-3">
        {order.items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-soft">
              <ProductThumb image={item.image} emoji={item.emoji} alt={item.productName} sizes="56px" className="p-1" emojiClassName="text-2xl" />
            </span>
            <span className="min-w-0 flex-1">
              {item.productId ? (
                <Link href={`/p/${item.productId}`} className="line-clamp-2-safe text-sm text-ink hover:text-brand-700">
                  {item.productName}
                </Link>
              ) : (
                <span className="line-clamp-2-safe text-sm text-ink">{item.productName}</span>
              )}
              <span className="block text-xs text-ink-faint">
                {item.quantity} × {formatPrice(item.price)}
              </span>
            </span>
            <span className="text-sm font-semibold text-ink">{formatPrice(item.total)}</span>
          </li>
        ))}
      </ul>

      <dl className="grid gap-2 border-t border-line pt-4 text-sm sm:grid-cols-2">
        <div className="flex justify-between gap-3 sm:block">
          <dt className="text-ink-faint">Yetkazib berish</dt>
          <dd className="text-ink">{DELIVERY_METHOD_LABELS[order.deliveryMethod] ?? order.deliveryMethod}</dd>
        </div>
        <div className="flex justify-between gap-3 sm:block">
          <dt className="text-ink-faint">To‘lov</dt>
          <dd className="text-ink">
            {paymentLabel(order.paymentMethod)} · {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
          </dd>
        </div>
        {order.address && (
          <div className="flex justify-between gap-3 sm:col-span-2 sm:block">
            <dt className="text-ink-faint">Manzil</dt>
            <dd className="text-right text-ink sm:text-left">
              {[order.region, order.district, order.address].filter(Boolean).join(', ')}
            </dd>
          </div>
        )}
      </dl>

      <footer className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm text-ink-muted">Jami</span>
        <span className="text-lg font-bold text-ink">{formatPrice(order.total)}</span>
      </footer>
    </article>
  )
}
