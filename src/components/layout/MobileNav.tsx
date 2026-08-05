'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useHydrated } from '@/hooks/useHydrated'
import { cartCount, useCart } from '@/lib/store/cart'
import { useWishlist } from '@/lib/store/wishlist'
import { cn } from '@/lib/utils/cn'
import { IconCart, IconGrid, IconHeart, IconHome, IconUser } from '@/components/ui/icons'

const ITEMS = [
  { href: '/', label: 'Bosh sahifa', Icon: IconHome },
  { href: '/catalog', label: 'Katalog', Icon: IconGrid },
  { href: '/wishlist', label: 'Sevimli', Icon: IconHeart, badge: 'wishlist' as const },
  { href: '/cart', label: 'Savat', Icon: IconCart, badge: 'cart' as const },
  { href: '/account', label: 'Kabinet', Icon: IconUser },
]

export function MobileNav() {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const lines = useCart((s) => s.lines)
  const wishIds = useWishlist((s) => s.ids)

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Asosiy navigatsiya"
    >
      <ul className="flex items-stretch">
        {ITEMS.map(({ href, label, Icon, badge }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          const count = !hydrated ? 0 : badge === 'cart' ? cartCount(lines) : badge === 'wishlist' ? wishIds.length : 0
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  'flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                  active ? 'text-brand-700' : 'text-ink-muted',
                )}
              >
                <span className="relative">
                  <Icon className="h-[22px] w-[22px]" />
                  {count > 0 && (
                    <span className="absolute -right-2 -top-1.5 grid h-[16px] min-w-[16px] place-items-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-ink">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
