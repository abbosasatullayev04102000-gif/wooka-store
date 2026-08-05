import Link from 'next/link'
import { getContactInfo } from '@/lib/db/content'
import { getRootCategories } from '@/lib/db/categories'
import { categoryHref } from '@/lib/utils/slug'
import { Logo } from './Logo'
import { IconMail, IconPhone } from '@/components/ui/icons'

const HELP_LINKS = [
  { href: '/contact', label: 'Aloqa' },
  { href: '/contact#delivery', label: 'Yetkazib berish' },
  { href: '/contact#returns', label: 'Qaytarish shartlari' },
  { href: '/contact#payment', label: 'To‘lov usullari' },
  { href: '/account/orders', label: 'Buyurtmani kuzatish' },
]

const COMPANY_LINKS = [
  { href: '/promotions', label: 'Aksiyalar' },
  { href: '/brands', label: 'Brendlar' },
  { href: '/catalog', label: 'Barcha kategoriyalar' },
]

export async function Footer() {
  const [contact, categories] = await Promise.all([
    getContactInfo().catch(() => null),
    getRootCategories().catch(() => []),
  ])

  return (
    <footer className="mt-10 border-t border-line bg-white">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-ink-muted">
            WOOKA — bolalar uchun sifatli o‘yinchoqlar, konstruktorlar va rivojlantiruvchi to‘plamlar. Butun
            O‘zbekiston bo‘ylab yetkazib berish.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            {contact?.phone && (
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-ink hover:text-brand-700">
                <IconPhone className="h-4 w-4 text-brand-600" />
                {contact.phone}
              </a>
            )}
            {contact?.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-ink hover:text-brand-700">
                <IconMail className="h-4 w-4 text-brand-600" />
                {contact.email}
              </a>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink">Kategoriyalar</h2>
          <ul className="space-y-2 text-sm text-ink-muted">
            {categories.slice(0, 7).map((c) => (
              <li key={c.id}>
                <Link href={categoryHref(c)} className="hover:text-brand-700">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink">Yordam</h2>
          <ul className="space-y-2 text-sm text-ink-muted">
            {HELP_LINKS.map((l) => (
              <li key={l.href + l.label}>
                <Link href={l.href} className="hover:text-brand-700">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink">WOOKA</h2>
          <ul className="space-y-2 text-sm text-ink-muted">
            {COMPANY_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-brand-700">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          {contact && (
            <div className="mt-4 flex gap-2">
              <a
                href={contact.telegram}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-lg bg-surface-soft px-3 py-1.5 text-xs font-medium text-ink hover:bg-brand-50 hover:text-brand-700"
              >
                Telegram
              </a>
              <a
                href={contact.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-lg bg-surface-soft px-3 py-1.5 text-xs font-medium text-ink hover:bg-brand-50 hover:text-brand-700"
              >
                Instagram
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} WOOKA. Barcha huquqlar himoyalangan.</p>
          <p className="flex flex-wrap items-center gap-3">
            <span>To‘lov usullari:</span>
            <span className="font-medium text-ink-muted">Payme</span>
            <span className="font-medium text-ink-muted">Click</span>
            <span className="font-medium text-ink-muted">Uzum Bank</span>
            <span className="font-medium text-ink-muted">Naqd</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
