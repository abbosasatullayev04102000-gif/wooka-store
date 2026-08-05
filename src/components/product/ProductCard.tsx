import Link from 'next/link'
import type { Product } from '@/lib/db/types'
import { formatPrice, monthlyInstalment } from '@/lib/utils/format'
import { productHref } from '@/lib/utils/slug'
import { cn } from '@/lib/utils/cn'
import { Rating } from '@/components/ui/Rating'
import { AddToCartButton } from './AddToCartButton'
import { ProductThumb } from './ProductThumb'
import { WishlistButton } from './WishlistButton'

interface Props {
  product: Product
  /** `rail` = fixed width for horizontal scrollers, `grid` = fluid. */
  layout?: 'grid' | 'rail'
  priority?: boolean
  className?: string
}

export function ProductCard({ product, layout = 'grid', priority = false, className }: Props) {
  const href = productHref(product)
  const discount = product.discountPercent > 0 ? product.discountPercent : null
  const lowStock = product.stock > 0 && product.stock <= 5

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow duration-200 hover:shadow-card-hover',
        layout === 'rail' && 'w-[164px] shrink-0 sm:w-[190px] lg:w-[212px]',
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-surface-soft">
        <Link href={href} className="absolute inset-0 z-[1]" aria-label={product.name} />
        <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
          <ProductThumb
            image={product.images[0]?.url}
            emoji={product.emoji}
            alt={product.name}
            priority={priority}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
            className="p-3"
            emojiClassName="text-6xl"
          />
        </div>

        <div className="pointer-events-none absolute left-2 top-2 z-[2] flex flex-col items-start gap-1">
          {discount !== null && (
            <span className="rounded-md bg-danger px-1.5 py-0.5 text-[11px] font-bold text-white">−{discount}%</span>
          )}
          {product.isNew && discount === null && (
            <span className="rounded-md bg-brand-600 px-1.5 py-0.5 text-[11px] font-bold text-white">Yangi</span>
          )}
          {product.isBestseller && (
            <span className="rounded-md bg-accent-500 px-1.5 py-0.5 text-[11px] font-bold text-ink">Hit</span>
          )}
        </div>

        <WishlistButton productId={product.id} size="sm" className="absolute right-2 top-2 z-[2] shadow-sm" />

        {product.stock <= 0 && (
          <div className="absolute inset-0 z-[2] grid place-items-center bg-white/70">
            <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-ink-muted shadow-card">
              Sotuvda yo‘q
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 pt-2.5">
        {product.rating > 0 && <Rating value={product.rating} size="xs" />}

        <h3 className="text-[13px] leading-snug text-ink">
          <Link href={href} className="line-clamp-2-safe hover:text-brand-700">
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto pt-1.5">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className={cn('font-bold text-ink', discount !== null && 'text-danger')}>
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-ink-faint line-through">
                {formatPrice(product.oldPrice, { withCurrency: false })}
              </span>
            )}
          </div>

          {product.price >= 200000 && (
            <p className="mt-1 inline-block rounded-md bg-surface-soft px-1.5 py-0.5 text-[11px] text-ink-muted">
              {formatPrice(monthlyInstalment(product.price))}/oy
            </p>
          )}

          {lowStock && <p className="mt-1 text-[11px] font-medium text-danger">Omborda {product.stock} dona qoldi</p>}
        </div>

        <AddToCartButton product={product} className="mt-2" />
      </div>
    </article>
  )
}

export function ProductCardSkeleton({ layout = 'grid' }: { layout?: 'grid' | 'rail' }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-line bg-white',
        layout === 'rail' && 'w-[164px] shrink-0 sm:w-[190px] lg:w-[212px]',
      )}
    >
      <div className="skeleton aspect-square" />
      <div className="space-y-2 p-3">
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
        <div className="skeleton h-5 w-2/5 rounded" />
        <div className="skeleton h-9 w-full rounded-lg" />
      </div>
    </div>
  )
}
