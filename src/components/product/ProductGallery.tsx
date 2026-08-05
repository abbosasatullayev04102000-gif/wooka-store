'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { ProductImage } from '@/lib/db/types'
import { BLUR_DATA_URL, imageProps } from '@/lib/utils/image'
import { cn } from '@/lib/utils/cn'
import { IconChevronLeft, IconChevronRight, IconClose } from '@/components/ui/icons'

/**
 * The merchant app stores a single image per product (`data.img`), so this
 * usually renders one frame — but it already supports several, ready for the
 * day the dashboard saves a gallery. With no image at all it falls back to the
 * product's emoji, which is what the dashboard itself displays.
 */
export function ProductGallery({ images, name, emoji }: { images: ProductImage[]; name: string; emoji?: string }) {
  const [index, setIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const hasImages = images.length > 0
  const current = images[index]

  const go = (delta: number) => {
    if (!hasImages) return
    setIndex((i) => (i + delta + images.length) % images.length)
  }

  useEffect(() => {
    if (!zoomed) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomed(false)
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % Math.max(1, images.length))
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + Math.max(1, images.length)) % Math.max(1, images.length))
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [zoomed, images.length])

  return (
    <>
      <div className="flex gap-3 lg:gap-4">
        {images.length > 1 && (
          <div className="hidden w-16 shrink-0 flex-col gap-2 lg:flex">
            {images.slice(0, 7).map((img, i) => (
              <button
                key={img.url + i}
                onMouseEnter={() => setIndex(i)}
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}-rasm`}
                className={cn(
                  'relative aspect-square overflow-hidden rounded-lg border bg-white transition-colors',
                  i === index ? 'border-brand-500' : 'border-line hover:border-brand-300',
                )}
              >
                <Image {...imageProps(img.url)} alt="" fill sizes="64px" className="object-contain p-1" />
              </button>
            ))}
          </div>
        )}

        <div className="relative min-w-0 flex-1">
          <button
            type="button"
            onClick={() => hasImages && setZoomed(true)}
            disabled={!hasImages}
            className="relative block aspect-square w-full overflow-hidden rounded-2xl border border-line bg-white disabled:cursor-default"
            aria-label={hasImages ? 'Rasmni kattalashtirish' : name}
          >
            {hasImages ? (
              <Image
                {...imageProps(current!.url)}
                alt={name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 520px"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-contain p-4"
              />
            ) : (
              <span aria-hidden className="absolute inset-0 grid select-none place-items-center text-[120px]">
                {emoji || '🧸'}
              </span>
            )}
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                aria-label="Oldingi rasm"
                className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-card hover:bg-white lg:hidden"
              >
                <IconChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Keyingi rasm"
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-card hover:bg-white lg:hidden"
              >
                <IconChevronRight className="h-4 w-4" />
              </button>

              <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar lg:hidden">
                {images.map((img, i) => (
                  <button
                    key={img.url + i}
                    onClick={() => setIndex(i)}
                    aria-label={`${i + 1}-rasm`}
                    className={cn(
                      'relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-white',
                      i === index ? 'border-brand-500' : 'border-line',
                    )}
                  >
                    <Image {...imageProps(img.url)} alt="" fill sizes="56px" className="object-contain p-1" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {zoomed && hasImages && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/90 p-4 animate-fade-in"
          onClick={() => setZoomed(false)}
        >
          <button
            onClick={() => setZoomed(false)}
            aria-label="Yopish"
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <IconClose className="h-6 w-6" />
          </button>

          <div className="relative h-full max-h-[80vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image {...imageProps(current!.url)} alt={name} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </>
  )
}
