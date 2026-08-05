'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Category } from '@/lib/db/types'
import { categoryHref } from '@/lib/utils/slug'
import { cn } from '@/lib/utils/cn'
import { IconChevronRight, IconClose, IconGrid } from '@/components/ui/icons'

export function CatalogMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(categories[0]?.id ?? null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const active = categories.find((c) => c.id === activeId) ?? categories[0]

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          'inline-flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors lg:h-12',
          open ? 'bg-brand-700 text-white' : 'bg-brand-600 text-white hover:bg-brand-700',
        )}
      >
        {open ? <IconClose className="h-[18px] w-[18px]" /> : <IconGrid className="h-[18px] w-[18px]" />}
        <span className="hidden sm:inline">Katalog</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 top-[var(--header-h)] z-30 bg-ink/40 animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-40 hidden lg:block">
            <div className="container-page">
              <div className="grid max-h-[70vh] grid-cols-[280px_1fr] overflow-hidden rounded-2xl border border-line bg-white shadow-pop animate-slide-up">
                <nav className="overflow-y-auto border-r border-line bg-surface-soft py-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={categoryHref(cat)}
                      onMouseEnter={() => setActiveId(cat.id)}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors',
                        cat.id === active?.id ? 'bg-white font-semibold text-brand-700' : 'text-ink hover:bg-white',
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        {cat.image && (
                          <Image src={cat.image} alt="" width={24} height={24} className="h-6 w-6 rounded object-contain" />
                        )}
                        <span className="truncate">{cat.name}</span>
                      </span>
                      {Boolean(cat.children?.length) && <IconChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />}
                    </Link>
                  ))}
                </nav>

                <div className="overflow-y-auto p-6">
                  {active && (
                    <>
                      <Link
                        href={categoryHref(active)}
                        onClick={() => setOpen(false)}
                        className="mb-4 inline-flex items-center gap-1.5 text-lg font-bold text-ink hover:text-brand-700"
                      >
                        {active.name}
                        <IconChevronRight className="h-4 w-4" />
                      </Link>

                      {active.children?.length ? (
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 xl:grid-cols-3">
                          {active.children.map((child) => (
                            <div key={child.id} className="py-1">
                              <Link
                                href={categoryHref(child)}
                                onClick={() => setOpen(false)}
                                className="text-sm font-semibold text-ink hover:text-brand-700"
                              >
                                {child.name}
                              </Link>
                              {child.children?.length ? (
                                <ul className="mt-1 space-y-1">
                                  {child.children.slice(0, 6).map((leaf) => (
                                    <li key={leaf.id}>
                                      <Link
                                        href={categoryHref(leaf)}
                                        onClick={() => setOpen(false)}
                                        className="text-[13px] text-ink-muted hover:text-brand-600"
                                      >
                                        {leaf.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-ink-muted">Ushbu bo‘limdagi barcha mahsulotlarni ko‘rish uchun bosing.</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile / tablet drawer */}
          <div className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto bg-white p-4 lg:hidden animate-slide-up">
            <ul className="divide-y divide-line">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={categoryHref(cat)}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between gap-3 py-3.5 text-sm font-medium"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      {cat.image && (
                        <Image src={cat.image} alt="" width={28} height={28} className="h-7 w-7 rounded object-contain" />
                      )}
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <IconChevronRight className="h-4 w-4 text-ink-faint" />
                  </Link>
                  {cat.children?.length ? (
                    <ul className="-mt-1 mb-3 flex flex-wrap gap-2 pl-10">
                      {cat.children.slice(0, 8).map((child) => (
                        <li key={child.id}>
                          <Link
                            href={categoryHref(child)}
                            onClick={() => setOpen(false)}
                            className="inline-block rounded-full bg-surface-soft px-3 py-1 text-xs text-ink-muted"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  )
}
