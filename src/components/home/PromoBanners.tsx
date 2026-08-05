import Image from 'next/image'
import Link from 'next/link'
import type { Banner } from '@/lib/db/types'

export function PromoBanners({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null
  const items = banners.slice(0, 3)

  return (
    <section className="mt-8 lg:mt-10">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((b) => (
          <li key={b.id}>
            <Link
              href={b.link || '/promotions'}
              className="group relative block aspect-[16/7] overflow-hidden rounded-2xl bg-surface-sunken"
            >
              {b.image && (
                <Image
                  src={b.image}
                  alt={b.title ?? ''}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              )}
              {(b.title || b.subtitle) && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-4">
                  {b.title && <span className="block text-sm font-bold text-white">{b.title}</span>}
                  {b.subtitle && <span className="block text-xs text-white/80">{b.subtitle}</span>}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
