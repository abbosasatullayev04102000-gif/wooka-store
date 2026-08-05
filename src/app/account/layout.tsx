import Link from 'next/link'
import { IconBox, IconHeart, IconUser } from '@/components/ui/icons'

const TABS = [
  { href: '/account', label: 'Profil', Icon: IconUser },
  { href: '/account/orders', label: 'Buyurtmalarim', Icon: IconBox },
  { href: '/wishlist', label: 'Sevimlilar', Icon: IconHeart },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page py-6">
      <h1 className="mb-5 text-xl font-bold text-ink sm:text-2xl">Shaxsiy kabinet</h1>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-start">
        <nav aria-label="Kabinet bo‘limlari">
          <ul className="rail gap-2 lg:flex-col lg:overflow-visible">
            {TABS.map(({ href, label, Icon }) => (
              <li key={href} className="lg:w-full">
                <Link
                  href={href}
                  className="inline-flex h-11 w-full items-center gap-2.5 whitespace-nowrap rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink transition-colors hover:border-brand-300 hover:text-brand-700"
                >
                  <Icon className="h-[18px] w-[18px] text-brand-600" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
