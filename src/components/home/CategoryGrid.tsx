import Image from 'next/image'
import Link from 'next/link'
import type { Category } from '@/lib/db/types'
import { categoryHref } from '@/lib/utils/slug'
import { Section } from './Section'

export function CategoryGrid({ categories, title = 'Kategoriyalar' }: { categories: Category[]; title?: string }) {
  if (!categories.length) return null

  return (
    <Section title={title} href="/catalog">
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {categories.slice(0, 16).map((cat) => (
          <li key={cat.id}>
            <Link
              href={categoryHref(cat)}
              className="group flex h-full flex-col items-center gap-2 rounded-2xl border border-line bg-white p-3 text-center transition-all hover:border-brand-300 hover:shadow-card"
            >
              <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-xl bg-surface-soft transition-transform group-hover:scale-105">
                {cat.image ? (
                  <Image src={cat.image} alt="" width={56} height={56} className="h-14 w-14 object-contain" />
                ) : (
                  <span aria-hidden className="text-2xl">
                    🧸
                  </span>
                )}
              </span>
              <span className="line-clamp-2-safe text-[12px] font-medium leading-tight text-ink">{cat.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}
