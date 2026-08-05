'use client'

import { useEffect, useState } from 'react'
import { fetchProductsByIds } from '@/lib/db/clientProducts'
import { useRecentlyViewed } from '@/lib/store/recentlyViewed'
import type { Product } from '@/lib/db/types'
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard'
import { Section } from './Section'

/**
 * Rendered entirely on the client: the id list lives in localStorage, so the
 * server has nothing to prerender.
 */
export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const ids = useRecentlyViewed((s) => s.ids)
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    const wanted = ids.filter((id) => id !== excludeId).slice(0, 12)
    if (!wanted.length) {
      setProducts([])
      return
    }
    let cancelled = false
    fetchProductsByIds(wanted)
      .then((list) => !cancelled && setProducts(list))
      .catch(() => !cancelled && setProducts([]))
    return () => {
      cancelled = true
    }
  }, [ids, excludeId])

  if (products === null) {
    return (
      <Section title="Yaqinda ko‘rilgan">
        <div className="rail -mx-3 px-3 sm:mx-0 sm:px-0">
          {[0, 1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} layout="rail" />
          ))}
        </div>
      </Section>
    )
  }

  if (!products.length) return null

  return (
    <Section title="Yaqinda ko‘rilgan">
      <div className="rail -mx-3 px-3 sm:mx-0 sm:px-0">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} layout="rail" />
        ))}
      </div>
    </Section>
  )
}
