import Link from 'next/link'
import type { Product } from '@/lib/db/types'
import { ProductCard } from '@/components/product/ProductCard'
import { cn } from '@/lib/utils/cn'
import { IconChevronRight } from '@/components/ui/icons'

interface SectionProps {
  title: string
  href?: string
  children: React.ReactNode
  className?: string
  accent?: boolean
}

export function Section({ title, href, children, className, accent }: SectionProps) {
  return (
    <section className={cn('mt-8 lg:mt-10', className)}>
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 className={cn('text-lg font-bold text-ink sm:text-xl lg:text-[22px]', accent && 'text-danger')}>{title}</h2>
        {href && (
          <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800">
            Barchasini ko‘rish
            <IconChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

export function ProductRail({
  title,
  href,
  products,
  accent,
  priorityFirst,
}: {
  title: string
  href?: string
  products: Product[]
  accent?: boolean
  priorityFirst?: boolean
}) {
  if (!products.length) return null
  return (
    <Section title={title} href={href} accent={accent}>
      <div className="rail -mx-3 px-3 sm:mx-0 sm:px-0">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} layout="rail" priority={priorityFirst && i < 3} />
        ))}
      </div>
    </Section>
  )
}

export function ProductGrid({ products, className }: { products: Product[]; className?: string }) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
        className,
      )}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
