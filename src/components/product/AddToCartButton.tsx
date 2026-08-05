'use client'

import { useHydrated } from '@/hooks/useHydrated'
import { useCart } from '@/lib/store/cart'
import { useToast } from '@/components/ui/Toast'
import type { Product } from '@/lib/db/types'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import { IconCart, IconCheck, IconMinus, IconPlus } from '@/components/ui/icons'

interface Props {
  product: Product
  variant?: 'card' | 'full'
  className?: string
}

export function AddToCartButton({ product, variant = 'card', className }: Props) {
  const hydrated = useHydrated()
  const add = useCart((s) => s.add)
  const lines = useCart((s) => s.lines)
  const increment = useCart((s) => s.increment)
  const decrement = useCart((s) => s.decrement)
  const { push } = useToast()

  const line = hydrated ? lines.find((l) => l.productId === product.id) : undefined
  const outOfStock = product.stock <= 0

  if (outOfStock) {
    return (
      <Button variant="outline" size={variant === 'full' ? 'lg' : 'sm'} fullWidth disabled className={className}>
        Sotuvda yo‘q
      </Button>
    )
  }

  if (line) {
    return (
      <div
        className={cn(
          'flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50',
          variant === 'full' ? 'h-[52px] px-2' : 'h-9 px-1.5',
          className,
        )}
      >
        <button
          type="button"
          aria-label="Kamaytirish"
          onClick={(e) => {
            e.preventDefault()
            decrement(product.id)
          }}
          className="grid h-7 w-7 place-items-center rounded-lg text-brand-700 transition-colors hover:bg-white"
        >
          <IconMinus className="h-4 w-4" />
        </button>
        <span className={cn('font-semibold text-brand-800', variant === 'full' ? 'text-base' : 'text-sm')}>
          {line.quantity} dona
        </span>
        <button
          type="button"
          aria-label="Ko‘paytirish"
          disabled={line.quantity >= product.stock}
          onClick={(e) => {
            e.preventDefault()
            increment(product.id)
          }}
          className="grid h-7 w-7 place-items-center rounded-lg text-brand-700 transition-colors hover:bg-white disabled:opacity-40"
        >
          <IconPlus className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <Button
      variant={variant === 'full' ? 'accent' : 'secondary'}
      size={variant === 'full' ? 'lg' : 'sm'}
      fullWidth
      className={className}
      onClick={(e) => {
        e.preventDefault()
        add(product, 1)
        push('Savatga qo‘shildi', 'success')
      }}
    >
      {variant === 'full' ? <IconCart className="h-5 w-5" /> : <IconCheck className="h-4 w-4" />}
      Savatga
    </Button>
  )
}
