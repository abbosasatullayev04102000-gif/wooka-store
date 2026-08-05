'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import type { Banner } from '@/lib/db/types'
import { cn } from '@/lib/utils/cn'
import { IconChevronLeft, IconChevronRight, IconCreditCard, IconShield, IconTruck } from '@/components/ui/icons'

const FALLBACK_SLIDE = {
  id: 'fallback',
  title: 'Bolaligingizning eng yaxshi do‘koni',
  subtitle: 'Sifatli o‘yinchoqlar, qulay narxlar va tez yetkazib berish!',
  link: '/catalog',
}

export function HeroSlider({ banners }: { banners: Banner[] }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: 'start', duration: 22 })
  const [selected, setSelected] = useState(0)
  const slides = banners.length ? banners : []

  const onSelect = useCallback(() => {
    if (embla) setSelected(embla.selectedScrollSnap())
  }, [embla])

  useEffect(() => {
    if (!embla) return
    onSelect()
    embla.on('select', onSelect)
    return () => {
      embla.off('select', onSelect)
    }
  }, [embla, onSelect])

  // Auto-advance, paused while the tab is hidden or the user is hovering.
  useEffect(() => {
    if (!embla || slides.length < 2) return
    let paused = false
    const node = embla.rootNode()
    const enter = () => (paused = true)
    const leave = () => (paused = false)
    node.addEventListener('mouseenter', enter)
    node.addEventListener('mouseleave', leave)
    const timer = setInterval(() => {
      if (!paused && document.visibilityState === 'visible') embla.scrollNext()
    }, 6000)
    return () => {
      clearInterval(timer)
      node.removeEventListener('mouseenter', enter)
      node.removeEventListener('mouseleave', leave)
    }
  }, [embla, slides.length])

  if (!slides.length) {
    return (
      <section className="brand-gradient relative overflow-hidden rounded-2xl px-6 py-12 text-white sm:px-10 sm:py-16">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-2xl font-bold leading-tight sm:text-4xl">{FALLBACK_SLIDE.title}</h1>
          <p className="mt-2 text-4xl font-extrabold text-accent-400 sm:text-6xl">WOOKA</p>
          <p className="mt-3 text-sm text-white/85 sm:text-base">{FALLBACK_SLIDE.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Badge icon={<IconShield className="h-4 w-4" />} label="100% sifat kafolati" />
            <Badge icon={<IconTruck className="h-4 w-4" />} label="Tez yetkazib berish" />
            <Badge icon={<IconCreditCard className="h-4 w-4" />} label="Oson to‘lov" />
          </div>
          <Link
            href={FALLBACK_SLIDE.link}
            className="mt-6 inline-flex h-12 items-center rounded-xl bg-accent-500 px-6 text-sm font-semibold text-ink transition-colors hover:bg-accent-400"
          >
            Xaridni boshlash
          </Link>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-32 right-24 h-80 w-80 rounded-full bg-accent-400/20" />
      </section>
    )
  }

  return (
    <section className="relative" aria-roledescription="carousel" aria-label="Aksiyalar">
      <div ref={emblaRef} className="overflow-hidden rounded-2xl">
        <div className="flex touch-pan-y">
          {slides.map((banner, i) => {
            const content = (
              <div className="relative aspect-[16/7] w-full overflow-hidden bg-brand-600 sm:aspect-[1000/320]">
                {banner.image && (
                  <>
                    <Image
                      src={banner.image}
                      alt={banner.title ?? 'WOOKA aksiya'}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 1440px) 100vw, 1440px"
                      className="hidden object-cover sm:block"
                    />
                    <Image
                      src={banner.imageMobile || banner.image}
                      alt={banner.title ?? 'WOOKA aksiya'}
                      fill
                      priority={i === 0}
                      sizes="100vw"
                      className="object-cover sm:hidden"
                    />
                  </>
                )}
              </div>
            )
            return (
              <div className="min-w-0 flex-[0_0_100%]" key={banner.id}>
                {banner.link ? (
                  <Link href={banner.link} aria-label={banner.title ?? 'Aksiya'}>
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </div>
            )
          })}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <NavButton side="left" onClick={() => embla?.scrollPrev()} />
          <NavButton side="right" onClick={() => embla?.scrollNext()} />
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => embla?.scrollTo(i)}
                aria-label={`${i + 1}-slayd`}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === selected ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/80',
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function NavButton({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  const Icon = side === 'left' ? IconChevronLeft : IconChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Oldingi' : 'Keyingi'}
      className={cn(
        'absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink shadow-card backdrop-blur transition-colors hover:bg-white sm:grid',
        side === 'left' ? 'left-4' : 'right-4',
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-medium backdrop-blur-sm">
      {icon}
      {label}
    </span>
  )
}
