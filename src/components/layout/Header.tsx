import Link from 'next/link'
import { Suspense } from 'react'
import { getCategoryTree } from '@/lib/db/categories'
import { getContactInfo } from '@/lib/db/content'
import type { Category } from '@/lib/db/types'
import { categoryHref } from '@/lib/utils/slug'
import { CatalogMenu } from './CatalogMenu'
import { HeaderActions } from './HeaderActions'
import { Logo } from './Logo'
import { SearchBar } from './SearchBar'
import { IconPin, IconTag } from '@/components/ui/icons'

function CategoryStrip({ categories }: { categories: Category[] }) {
  if (!categories.length) return null
  return (
    <div className="hidden border-t border-line bg-white lg:block">
      <div className="container-page">
        <ul className="rail py-2">
          {categories.slice(0, 12).map((cat) => (
            <li key={cat.id}>
              <Link
                href={categoryHref(cat)}
                className="inline-flex h-9 items-center whitespace-nowrap rounded-lg px-3 text-[13px] font-medium text-ink transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {cat.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/promotions"
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[13px] font-semibold text-danger transition-colors hover:bg-red-50"
            >
              <IconTag className="h-4 w-4" />
              Aksiyalar
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

function TopBar({ phone }: { phone?: string }) {
  return (
    <div className="hidden border-b border-line bg-surface-soft lg:block">
      <div className="container-page flex h-9 items-center justify-between text-[12px] text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <IconPin className="h-3.5 w-3.5 text-brand-600" />
          Yetkazib berish: Toshkent
        </span>
        <nav className="flex items-center gap-5">
          <Link href="/promotions" className="hover:text-brand-700">
            Aksiyalar
          </Link>
          <Link href="/brands" className="hover:text-brand-700">
            Brendlar
          </Link>
          <Link href="/contact" className="hover:text-brand-700">
            Yordam
          </Link>
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="font-semibold text-ink hover:text-brand-700">
              {phone}
            </a>
          )}
        </nav>
      </div>
    </div>
  )
}

export async function Header() {
  const [categories, contact] = await Promise.all([
    getCategoryTree().catch(() => [] as Category[]),
    getContactInfo().catch(() => null),
  ])

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <TopBar phone={contact?.phone} />

      <div className="relative">
        <div className="container-page flex h-[68px] items-center gap-3 lg:h-[76px] lg:gap-5">
          <Logo />
          <CatalogMenu categories={categories} />
          <Suspense fallback={<div className="hidden h-11 flex-1 rounded-xl bg-surface-sunken md:block lg:h-12" />}>
            <SearchBar className="hidden flex-1 md:block" />
          </Suspense>
          <HeaderActions className="ml-auto" />
        </div>

        <div className="container-page pb-2.5 md:hidden">
          <Suspense fallback={<div className="h-11 rounded-xl bg-surface-sunken" />}>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      <CategoryStrip categories={categories} />
    </header>
  )
}
