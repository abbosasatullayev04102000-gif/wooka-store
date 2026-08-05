import Link from 'next/link'
import type { Category } from '@/lib/db/types'
import { categoryHref } from '@/lib/utils/slug'

const STATIC_LINKS = [
  { href: '/search?sort=new', label: 'Yangi kelganlar', emoji: '🆕' },
  { href: '/promotions', label: 'Chegirmadagilar', emoji: '🎁' },
  { href: '/search?sort=popular', label: 'Eng ko‘p sotilganlar', emoji: '🏆' },
  { href: '/search?inStock=1', label: 'Sotuvda bor', emoji: '✅' },
]

/**
 * The merchant schema has no age fields on products, so the quick links point
 * at real categories instead of inventing an age filter that would return
 * nothing. Add `ageMin`/`ageMax` to the product jsonb in the dashboard and an
 * age filter can be reinstated.
 */
export function QuickLinks({ categories = [] }: { categories?: Category[] }) {
  const catLinks = categories.slice(0, 6).map((c) => ({
    href: categoryHref(c),
    label: c.name,
    emoji: c.emoji || '🧸',
  }))

  const links = [...STATIC_LINKS, ...catLinks]

  return (
    <nav aria-label="Tezkor havolalar" className="mt-4">
      <ul className="rail -mx-3 px-3 sm:mx-0 sm:px-0">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="flex h-[54px] shrink-0 items-center gap-2.5 rounded-xl border border-line bg-white px-4 text-[13px] font-medium text-ink transition-all hover:border-brand-300 hover:shadow-card"
            >
              <span aria-hidden className="text-lg">
                {l.emoji}
              </span>
              <span className="whitespace-nowrap">{l.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
