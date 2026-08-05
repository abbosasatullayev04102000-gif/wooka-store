import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Advantages } from '@/components/home/Advantages'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { HeroSlider } from '@/components/home/HeroSlider'
import { PromoBanners } from '@/components/home/PromoBanners'
import { QuickLinks } from '@/components/home/QuickLinks'
import { RecentlyViewed } from '@/components/home/RecentlyViewed'
import { ReviewsSection } from '@/components/home/ReviewsSection'
import { ProductRail } from '@/components/home/Section'
import { ProductCardSkeleton } from '@/components/product/ProductCard'
import { getRootCategories } from '@/lib/db/categories'
import { getHeroBanners, getPromoBanners } from '@/lib/db/content'
import { getBestSellers, getDiscounted, getNewArrivals, getRecommended } from '@/lib/db/products'
import { getFeaturedReviews } from '@/lib/db/reviews'
import { buildMetadata } from '@/lib/utils/seo'

export const revalidate = 300

export const metadata: Metadata = buildMetadata({
  title: 'WOOKA — Bolalar o‘yinchoq do‘koni',
  description:
    'O‘yinchoqlar, konstruktorlar, rivojlantiruvchi to‘plamlar va maktab anjomlari. Toshkent bo‘ylab 2 soatda, O‘zbekiston bo‘ylab 1–3 kunda yetkazib berish.',
  path: '/',
})

function RailSkeleton() {
  return (
    <div className="mt-8 lg:mt-10">
      <div className="skeleton mb-3 h-6 w-48 rounded" />
      <div className="rail -mx-3 px-3 sm:mx-0 sm:px-0">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ProductCardSkeleton key={i} layout="rail" />
        ))}
      </div>
    </div>
  )
}

async function Hero() {
  const banners = await getHeroBanners().catch(() => [])
  return <HeroSlider banners={banners} />
}

async function Categories() {
  const categories = await getRootCategories().catch(() => [])
  return <CategoryGrid categories={categories} title="Ommabop kategoriyalar" />
}

async function Quick() {
  const categories = await getRootCategories().catch(() => [])
  return <QuickLinks categories={categories} />
}

async function Recommended() {
  const products = await getRecommended(14).catch(() => [])
  return <ProductRail title="Tavsiya etamiz" href="/search?sort=popular" products={products} priorityFirst />
}

async function Discounts() {
  const products = await getDiscounted(14).catch(() => [])
  return <ProductRail title="Chegirmadagi mahsulotlar" href="/promotions" products={products} accent />
}

async function NewArrivals() {
  const products = await getNewArrivals(14).catch(() => [])
  return <ProductRail title="Yangi kelganlar" href="/search?sort=new" products={products} />
}

async function BestSellers() {
  const products = await getBestSellers(14).catch(() => [])
  return <ProductRail title="Eng ko‘p sotilganlar" href="/search?sort=popular" products={products} />
}

async function Promos() {
  const banners = await getPromoBanners().catch(() => [])
  return <PromoBanners banners={banners} />
}

async function Reviews() {
  const reviews = await getFeaturedReviews(10).catch(() => [])
  return <ReviewsSection reviews={reviews} />
}

export default function HomePage() {
  return (
    <div className="container-page pb-8 pt-4">
      <Suspense fallback={<div className="skeleton aspect-[16/7] rounded-2xl sm:aspect-[1000/320]" />}>
        <Hero />
      </Suspense>

      <Suspense fallback={<div className="skeleton mt-4 h-[54px] rounded-xl" />}>
        <Quick />
      </Suspense>

      <Suspense fallback={<RailSkeleton />}>
        <Recommended />
      </Suspense>

      <Suspense fallback={<RailSkeleton />}>
        <Categories />
      </Suspense>

      <Suspense fallback={<RailSkeleton />}>
        <Discounts />
      </Suspense>

      <Suspense fallback={null}>
        <Promos />
      </Suspense>

      <Suspense fallback={<RailSkeleton />}>
        <NewArrivals />
      </Suspense>

      <Suspense fallback={<RailSkeleton />}>
        <BestSellers />
      </Suspense>

      <RecentlyViewed />

      <Advantages />

      <Suspense fallback={null}>
        <Reviews />
      </Suspense>
    </div>
  )
}
