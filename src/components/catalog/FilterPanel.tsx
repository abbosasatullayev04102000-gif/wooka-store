'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Brand } from '@/lib/db/types'
import { formatPrice } from '@/lib/utils/format'
import { toggleListParam, withParam } from '@/lib/utils/searchParams'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import { IconClose, IconFilter } from '@/components/ui/icons'


interface Props {
  brands: Brand[]
  priceBounds: { min: number; max: number }
  activeCount: number
}

export function FilterPanel({ brands, priceBounds, activeCount }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="md"
        className="w-full lg:hidden"
        onClick={() => setOpen(true)}
        aria-expanded={open}
      >
        <IconFilter className="h-4 w-4" />
        Filtrlar
        {activeCount > 0 && (
          <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </Button>

      <aside className="hidden w-[248px] shrink-0 lg:block">
        <FilterBody brands={brands} priceBounds={priceBounds} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
            <span className="font-semibold">Filtrlar</span>
            <button onClick={() => setOpen(false)} aria-label="Yopish" className="p-2">
              <IconClose className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <FilterBody brands={brands} priceBounds={priceBounds} onApply={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}

function FilterBody({
  brands,
  priceBounds,
  onApply,
}: {
  brands: Brand[]
  priceBounds: { min: number; max: number }
  onApply?: () => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const [minPrice, setMinPrice] = useState(params.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') ?? '')

  useEffect(() => {
    setMinPrice(params.get('minPrice') ?? '')
    setMaxPrice(params.get('maxPrice') ?? '')
  }, [params])

  const push = (next: URLSearchParams) => {
    router.push(`${pathname}?${next.toString()}`, { scroll: false })
  }

  const applyPrice = () => {
    let next = withParam(params, 'minPrice', minPrice || null)
    next = withParam(next, 'maxPrice', maxPrice || null)
    push(next)
    onApply?.()
  }

  const activeBrands = new Set((params.get('brand') ?? '').split(',').filter(Boolean))

  return (
    <div className="space-y-5">
      <Group title="Narx, so‘m">
        <div className="flex items-center gap-2">
          <input
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ''))}
            placeholder={String(priceBounds.min || 0)}
            aria-label="Eng past narx"
            className="h-10 w-full rounded-lg border border-line-strong px-2.5 text-sm outline-none focus:border-brand-400"
          />
          <span className="text-ink-faint">—</span>
          <input
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ''))}
            placeholder={String(priceBounds.max || 0)}
            aria-label="Eng yuqori narx"
            className="h-10 w-full rounded-lg border border-line-strong px-2.5 text-sm outline-none focus:border-brand-400"
          />
        </div>
        <p className="mt-1.5 text-[11px] text-ink-faint">
          {formatPrice(priceBounds.min)} — {formatPrice(priceBounds.max)}
        </p>
        <Button variant="secondary" size="sm" fullWidth className="mt-2" onClick={applyPrice}>
          Qo‘llash
        </Button>
      </Group>


      {brands.length > 0 && (
        <Group title="Brend">
          <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
            {brands.map((b) => (
              <label key={b.id} className="flex cursor-pointer items-center gap-2.5 py-1 text-sm">
                <input
                  type="checkbox"
                  checked={activeBrands.has(b.id)}
                  onChange={() => push(toggleListParam(params, 'brand', b.id))}
                  className="h-4 w-4 rounded border-line-strong accent-brand-600"
                />
                <span className="truncate text-ink">{b.name}</span>
              </label>
            ))}
          </div>
        </Group>
      )}

      <Group title="Qo‘shimcha">
        <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm">
          <input
            type="checkbox"
            checked={params.get('inStock') === '1'}
            onChange={() => push(withParam(params, 'inStock', params.get('inStock') === '1' ? null : '1'))}
            className="h-4 w-4 rounded border-line-strong accent-brand-600"
          />
          Faqat sotuvda bor
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm">
          <input
            type="checkbox"
            checked={params.get('discount') === '1'}
            onChange={() => push(withParam(params, 'discount', params.get('discount') === '1' ? null : '1'))}
            className="h-4 w-4 rounded border-line-strong accent-brand-600"
          />
          Chegirmadagilar
        </label>
      </Group>

      <Button
        variant="ghost"
        size="sm"
        fullWidth
        onClick={() => {
          const next = new URLSearchParams()
          const q = params.get('q')
          if (q) next.set('q', q)
          push(next)
          onApply?.()
        }}
      >
        Filtrlarni tozalash
      </Button>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <h3 className="mb-2.5 text-[13px] font-semibold text-ink">{title}</h3>
      {children}
    </div>
  )
}
