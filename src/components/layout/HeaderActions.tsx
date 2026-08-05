'use client'

import Link from 'next/link'
import { useHydrated } from '@/hooks/useHydrated'
import { cartCount, useCart } from '@/lib/store/cart'
import { useWishlist } from '@/lib/store/wishlist'
import { cn } from '@/lib/utils/cn'
import { IconCart, IconHeart, IconUser } from '@/components/ui/icons'

function Counter({ value }: { value: number }) {
  if (value <= 0) return null
  return (
    <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-ink">
      {value > 99 ? '99+' : value}
    </span>
  )
}

function ActionLink({
  href,
  label,
  count,
  children,
}: {
  href: string
  label: string
  count?: number
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="group flex min-w-[52px] flex-col items-center gap-0.5 rounded-lg px-1.5 py-1 text-ink-muted transition-colors hover:text-brand-700"
    >
      <span className="relative">
        {children}
        {typeof count === 'number' && <Counter value={count} />}
      </span>
      <span className="hidden text-[11px] font-medium sm:block">{label}</span>
    </Link>
  )
}

export function HeaderActions({ className }: { className?: string }) {
  const hydrated = useHydrated()
  const lines = useCart((s) => s.lines)
  const wishIds = useWishlist((s) => s.ids)

  return (
    <nav className={cn('flex items-center gap-1 sm:gap-2', className)} aria-label="Hisob va savat">
      <ActionLink href="/account" label="Kirish">
        <IconUser className="h-[22px] w-[22px]" />
      </ActionLink>
      <ActionLink href="/wishlist" label="Sevimlilar" count={hydrated ? wishIds.length : 0}>
        <IconHeart className="h-[22px] w-[22px]" />
      </ActionLink>
      <ActionLink href="/cart" label="Savat" count={hydrated ? cartCount(lines) : 0}>
        <IconCart className="h-[22px] w-[22px]" />
      </ActionLink>
    </nav>
  )
}
