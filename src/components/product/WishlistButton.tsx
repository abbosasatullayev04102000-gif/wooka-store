'use client'

import { useHydrated } from '@/hooks/useHydrated'
import { useWishlist } from '@/lib/store/wishlist'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils/cn'
import { IconHeart } from '@/components/ui/icons'

export function WishlistButton({
  productId,
  className,
  size = 'md',
}: {
  productId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const hydrated = useHydrated()
  const toggle = useWishlist((s) => s.toggle)
  const ids = useWishlist((s) => s.ids)
  const { push } = useToast()
  const active = hydrated && ids.includes(productId)

  const box = { sm: 'h-8 w-8', md: 'h-9 w-9', lg: 'h-11 w-11' }[size]
  const icon = { sm: 'h-4 w-4', md: 'h-[18px] w-[18px]', lg: 'h-5 w-5' }[size]

  return (
    <button
      type="button"
      aria-label={active ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo‘shish'}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(productId)
        push(active ? 'Sevimlilardan olib tashlandi' : 'Sevimlilarga qo‘shildi', 'success')
      }}
      className={cn(
        'grid place-items-center rounded-full border transition-all duration-150 active:scale-90',
        box,
        active
          ? 'border-transparent bg-brand-600 text-white'
          : 'border-line bg-white/90 text-ink-muted hover:border-brand-300 hover:text-brand-600',
        className,
      )}
    >
      <IconHeart className={icon} fill={active ? 'currentColor' : 'none'} />
    </button>
  )
}
