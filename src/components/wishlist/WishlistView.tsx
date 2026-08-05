'use client'

import { useEffect, useState } from 'react'
import { fetchProductsByIds } from '@/lib/db/clientProducts'
import { useWishlist } from '@/lib/store/wishlist'
import { useCart } from '@/lib/store/cart'
import type { Product } from '@/lib/db/types'
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard'
import { Button, ButtonLink } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export function WishlistView() {
  const ids = useWishlist((s) => s.ids)
  const clear = useWishlist((s) => s.clear)
  const add = useCart((s) => s.add)
  const { push } = useToast()
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    if (!ids.length) {
      setProducts([])
      return
    }
    let cancelled = false
    fetchProductsByIds(ids)
      .then((list) => !cancelled && setProducts(list))
      .catch(() => !cancelled && setProducts([]))
    return () => {
      cancelled = true
    }
  }, [ids])

  if (products === null) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong bg-white px-6 py-16 text-center">
        <p className="text-4xl" aria-hidden>
          💜
        </p>
        <p className="mt-3 text-lg font-semibold text-ink">Sevimlilar ro‘yxati bo‘sh</p>
        <p className="mt-1 text-sm text-ink-muted">Yoqqan mahsulotlarni yurakcha tugmasi bilan saqlab qo‘ying.</p>
        <ButtonLink href="/catalog" variant="primary" size="lg" className="mt-5">
          Katalogga o‘tish
        </ButtonLink>
      </div>
    )
  }

  const inStock = products.filter((p) => p.stock > 0)

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!inStock.length}
          onClick={() => {
            inStock.forEach((p) => add(p, 1))
            push(`${inStock.length} ta mahsulot savatga qo‘shildi`, 'success')
          }}
        >
          Barchasini savatga
        </Button>
        <Button variant="ghost" size="sm" onClick={clear} className="text-ink-faint hover:text-danger">
          Ro‘yxatni tozalash
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  )
}
