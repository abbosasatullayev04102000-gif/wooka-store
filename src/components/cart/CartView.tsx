'use client'

import Link from 'next/link'
import { useHydrated } from '@/hooks/useHydrated'
import { cartSavings, cartSubtotal, useCart, type CartLine } from '@/lib/store/cart'
import { formatPrice, pluralise } from '@/lib/utils/format'
import { ProductThumb } from '@/components/product/ProductThumb'
import { Button, ButtonLink } from '@/components/ui/Button'
import { IconMinus, IconPlus, IconTrash } from '@/components/ui/icons'

export function CartView({ freeDeliveryFrom, deliveryFee }: { freeDeliveryFrom: number; deliveryFee: number }) {
  const hydrated = useHydrated()
  const lines = useCart((s) => s.lines)
  const clear = useCart((s) => s.clear)

  if (!hydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    )
  }

  if (!lines.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong bg-white px-6 py-16 text-center">
        <p className="text-4xl" aria-hidden>
          🛒
        </p>
        <p className="mt-3 text-lg font-semibold text-ink">Savat bo‘sh</p>
        <p className="mt-1 text-sm text-ink-muted">Katalogdan o‘zingizga yoqqan o‘yinchoqlarni tanlang.</p>
        <ButtonLink href="/catalog" variant="primary" size="lg" className="mt-5">
          Katalogga o‘tish
        </ButtonLink>
      </div>
    )
  }

  const subtotal = cartSubtotal(lines)
  const savings = cartSavings(lines)
  const shipping = subtotal >= freeDeliveryFrom ? 0 : deliveryFee
  const toFreeDelivery = Math.max(0, freeDeliveryFrom - subtotal)
  const count = lines.reduce((n, l) => n + l.quantity, 0)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-ink-muted">
            {count} {pluralise(count, ['mahsulot', 'mahsulot', 'mahsulot'])}
          </p>
          <button onClick={clear} className="text-sm text-ink-faint transition-colors hover:text-danger">
            Savatni tozalash
          </button>
        </div>

        <ul className="space-y-3">
          {lines.map((line) => (
            <CartRow key={line.productId} line={line} />
          ))}
        </ul>
      </div>

      <aside className="rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-[140px]">
        <h2 className="text-base font-semibold text-ink">Buyurtma</h2>

        {toFreeDelivery > 0 && (
          <div className="mt-3 rounded-xl bg-brand-50 p-3 text-xs text-brand-800">
            Bepul yetkazib berish uchun yana <b>{formatPrice(toFreeDelivery)}</b> qo‘shing
            <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white">
              <span
                className="block h-full rounded-full bg-brand-600 transition-all"
                style={{ width: `${Math.min(100, (subtotal / freeDeliveryFrom) * 100)}%` }}
              />
            </span>
          </div>
        )}

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Mahsulotlar</dt>
            <dd className="font-medium">{formatPrice(subtotal)}</dd>
          </div>
          {savings > 0 && (
            <div className="flex justify-between">
              <dt className="text-ink-muted">Chegirma</dt>
              <dd className="font-medium text-danger">−{formatPrice(savings)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-ink-muted">Yetkazib berish</dt>
            <dd className="font-medium">{shipping === 0 ? 'Bepul' : formatPrice(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2.5 text-base">
            <dt className="font-semibold">Jami</dt>
            <dd className="font-bold text-ink">{formatPrice(subtotal + shipping)}</dd>
          </div>
        </dl>

        <ButtonLink href="/checkout" variant="accent" size="lg" fullWidth className="mt-4">
          Rasmiylashtirish
        </ButtonLink>

        <p className="mt-3 text-center text-xs text-ink-faint">
          Buyurtma berish orqali siz{' '}
          <Link href="/contact#terms" className="underline hover:text-brand-700">
            shartlarga
          </Link>{' '}
          rozilik bildirasiz
        </p>
      </aside>
    </div>
  )
}

function CartRow({ line }: { line: CartLine }) {
  const setQuantity = useCart((s) => s.setQuantity)
  const remove = useCart((s) => s.remove)
  const href = `/p/${line.slug ? `${line.slug}-` : ''}${line.productId}`

  return (
    <li className="flex gap-3 rounded-2xl border border-line bg-white p-3 sm:gap-4 sm:p-4">
      <Link href={href} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-soft sm:h-24 sm:w-24">
        <ProductThumb image={line.image} emoji={line.emoji} alt={line.name} sizes="96px" className="p-1.5" emojiClassName="text-4xl" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={href} className="line-clamp-2-safe text-sm text-ink hover:text-brand-700">
          {line.name}
        </Link>

        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="font-semibold text-ink">{formatPrice(line.price)}</span>
          {line.oldPrice && line.oldPrice > line.price && (
            <span className="text-xs text-ink-faint line-through">{formatPrice(line.oldPrice, { withCurrency: false })}</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div className="flex h-9 items-center gap-1 rounded-lg border border-line-strong px-1">
            <button
              onClick={() => setQuantity(line.productId, line.quantity - 1)}
              aria-label="Kamaytirish"
              className="grid h-7 w-7 place-items-center rounded-md text-ink-muted hover:bg-surface-soft"
            >
              <IconMinus className="h-4 w-4" />
            </button>
            <span className="min-w-8 text-center text-sm font-medium">{line.quantity}</span>
            <button
              onClick={() => setQuantity(line.productId, line.quantity + 1)}
              disabled={line.quantity >= line.stock}
              aria-label="Ko‘paytirish"
              className="grid h-7 w-7 place-items-center rounded-md text-ink-muted hover:bg-surface-soft disabled:opacity-40"
            >
              <IconPlus className="h-4 w-4" />
            </button>
          </div>

          <span className="ml-auto hidden text-sm font-semibold text-ink sm:block">
            {formatPrice(line.price * line.quantity)}
          </span>

          <Button
            variant="ghost"
            size="sm"
            aria-label="O‘chirish"
            onClick={() => remove(line.productId)}
            className="text-ink-faint hover:text-danger"
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </li>
  )
}
