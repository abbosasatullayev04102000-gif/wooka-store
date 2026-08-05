'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils/format'
import { storageUrl } from '@/lib/utils/image'
import { ProductThumb } from '@/components/product/ProductThumb'
import { cn } from '@/lib/utils/cn'
import { IconClose, IconSearch } from '@/components/ui/icons'

interface Suggestion {
  id: string
  name: string
  slug: string | null
  price: number
  image: string | null
  emoji: string
}

const RECENT_KEY = 'wooka-recent-searches'

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const [term, setTerm] = useState(params.get('q') ?? '')
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const boxRef = useRef<HTMLDivElement>(null)
  const debounced = useDebounce(term, 250)

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'))
    } catch {
      setRecent([])
    }
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    const query = debounced.trim()
    if (query.length < 2) {
      setItems([])
      return
    }
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase.rpc('search_products', { p_query: query, p_limit: 8 })
        if (cancelled) return
        if (error) throw error
        setItems(
          (data ?? []).map((r: any) => ({
            id: String(r.id),
            name: r.name,
            slug: r.slug,
            price: Number(r.price ?? 0),
            image: r.image ? storageUrl(r.image) : null,
            emoji: r.emoji || '🧸',
          })),
        )
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [debounced])

  const persistRecent = (value: string) => {
    const next = [value, ...recent.filter((r) => r !== value)].slice(0, 6)
    setRecent(next)
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    } catch {
      /* storage unavailable — non-fatal */
    }
  }

  const submit = (value: string) => {
    const q = value.trim()
    if (!q) return
    persistRecent(q)
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      const picked = items[activeIndex]
      if (picked) {
        setOpen(false)
        router.push(`/p/${picked.slug ? `${picked.slug}-` : ''}${picked.id}`)
      } else {
        submit(term)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showDropdown = open && (items.length > 0 || loading || (term.length < 2 && recent.length > 0))

  return (
    <div ref={boxRef} className={cn('relative w-full', className)}>
      <div className="flex h-11 w-full items-center overflow-hidden rounded-xl border border-line-strong bg-white focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100 lg:h-12">
        <input
          type="search"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value)
            setOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Mahsulot, kategoriya yoki brendni qidiring..."
          aria-label="Qidiruv"
          className="h-full flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-ink-faint"
        />
        {term && (
          <button
            type="button"
            onClick={() => {
              setTerm('')
              setItems([])
            }}
            aria-label="Tozalash"
            className="grid h-8 w-8 place-items-center text-ink-faint hover:text-ink"
          >
            <IconClose className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => submit(term)}
          aria-label="Qidirish"
          className="grid h-full w-12 place-items-center text-ink-muted transition-colors hover:text-brand-600"
        >
          <IconSearch className="h-5 w-5" />
        </button>
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-line bg-white shadow-pop animate-slide-up">
          {term.length < 2 && recent.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                Oxirgi qidiruvlar
              </p>
              {recent.map((r) => (
                <button
                  key={r}
                  onClick={() => submit(r)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-soft"
                >
                  <IconSearch className="h-4 w-4 text-ink-faint" />
                  {r}
                </button>
              ))}
            </div>
          )}

          {loading && items.length === 0 && term.length >= 2 && (
            <div className="space-y-2 p-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton h-11 w-11 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-2/3 rounded" />
                    <div className="skeleton h-3 w-1/4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="max-h-[420px] overflow-y-auto p-2">
              {items.map((item, i) => (
                <Link
                  key={item.id}
                  href={`/p/${item.slug ? `${item.slug}-` : ''}${item.id}`}
                  onClick={() => {
                    persistRecent(term.trim())
                    setOpen(false)
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2 transition-colors',
                    i === activeIndex ? 'bg-brand-50' : 'hover:bg-surface-soft',
                  )}
                >
                  <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface-soft">
                    <ProductThumb
                      image={item.image}
                      emoji={item.emoji}
                      alt={item.name}
                      sizes="44px"
                      className="p-0.5"
                      emojiClassName="text-xl"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">{item.name}</span>
                    <span className="block text-xs font-semibold text-brand-700">{formatPrice(item.price)}</span>
                  </span>
                </Link>
              ))}
              <button
                onClick={() => submit(term)}
                className="mt-1 w-full rounded-xl bg-surface-soft px-3 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                “{term}” bo‘yicha barcha natijalar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
