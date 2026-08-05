import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ProductRail } from '@/components/home/Section'
import { RecentlyViewed } from '@/components/home/RecentlyViewed'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ReviewList } from '@/components/product/ReviewList'
import { TrackView } from '@/components/product/TrackView'
import { WishlistButton } from '@/components/product/WishlistButton'
import { JsonLd } from '@/components/seo/JsonLd'
import { Rating } from '@/components/ui/Rating'
import { IconBox, IconRefresh, IconShield, IconTruck } from '@/components/ui/icons'
import { getCategoryPath } from '@/lib/db/categories'
import { getAllProductRefs, getProductById, getSimilarProducts } from '@/lib/db/products'
import { getProductReviews, reviewsEnabled } from '@/lib/db/reviews'
import { getContactInfo } from '@/lib/db/content'
import { discountPercent, formatPrice, monthlyInstalment } from '@/lib/utils/format'
import { absoluteUrl, breadcrumbJsonLd, buildMetadata, productJsonLd } from '@/lib/utils/seo'
import { categoryHref, idFromSlug, productHref } from '@/lib/utils/slug'

export const revalidate = 120

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const refs = await getAllProductRefs(200).catch(() => [])
  return refs.map((r) => ({ slug: `${r.slug ? `${r.slug}-` : ''}${r.id}` }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductById(idFromSlug(slug)).catch(() => null)
  if (!product) return buildMetadata({ title: 'Mahsulot topilmadi', path: `/p/${slug}`, noIndex: true })

  return buildMetadata({
    title: product.name,
    description:
      product.shortDescription ||
      product.description?.slice(0, 160) ||
      `${product.name} — WOOKA do‘konida ${formatPrice(product.price)}. Tez yetkazib berish, kafolat.`,
    path: productHref(product),
    image: product.images[0]?.url,
  })
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getProductById(idFromSlug(slug)).catch(() => null)
  if (!product) notFound()

  const [path, reviews, similar, contact] = await Promise.all([
    product.categoryId ? getCategoryPath(product.categoryId).catch(() => []) : Promise.resolve([]),
    getProductReviews(product.id, 20).catch(() => []),
    getSimilarProducts(product, 12).catch(() => []),
    getContactInfo().catch(() => null),
  ])

  const url = absoluteUrl(productHref(product))
  const discount = discountPercent(product.price, product.oldPrice)
  const freeDeliveryFrom = contact?.freeDeliveryFrom ?? 300000

  return (
    <div className="container-page py-4">
      <TrackView productId={product.id} />
      <JsonLd
        data={[
          productJsonLd(product, url),
          breadcrumbJsonLd([
            { name: 'Bosh sahifa', path: '/' },
            { name: 'Katalog', path: '/catalog' },
            ...path.map((c) => ({ name: c.name, path: `/c/${c.slug ?? c.id}` })),
            { name: product.name, path: productHref(product) },
          ]),
        ]}
      />

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
        <Link href="/" className="hover:text-brand-700">
          Bosh sahifa
        </Link>
        {path.map((c) => (
          <span key={c.id} className="flex items-center gap-1.5">
            <span aria-hidden>/</span>
            <Link href={categoryHref(c)} className="hover:text-brand-700">
              {c.name}
            </Link>
          </span>
        ))}
        <span aria-hidden>/</span>
        <span className="truncate text-ink-faint">{product.name}</span>
      </nav>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
        {/* Gallery + description */}
        <div className="min-w-0">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,520px)_1fr] xl:gap-8">
            <ProductGallery images={product.images} name={product.name} emoji={product.emoji} />

            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-snug text-ink sm:text-xl lg:text-[22px]">{product.name}</h1>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Rating value={product.rating} count={product.reviewCount} size="sm" />
                {product.sku && <span className="text-xs text-ink-faint">Artikul: {product.sku}</span>}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-1 text-xs font-medium text-success">
                    Sotuvda bor{product.stock <= 5 ? ` — ${product.stock} dona` : ''}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-sunken px-2.5 py-1 text-xs font-medium text-ink-muted">
                    Sotuvda yo‘q
                  </span>
                )}
                {product.isNew && (
                  <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">Yangi</span>
                )}
                {product.brandName && (
                  <span className="rounded-lg bg-surface-soft px-2.5 py-1 text-xs text-ink-muted">
                    {product.brandName}
                  </span>
                )}
              </div>

              {product.description && (
                <div className="mt-6">
                  <h2 className="mb-2 text-base font-semibold text-ink">Tavsif</h2>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink-muted">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buy box */}
        <aside className="lg:sticky lg:top-[140px] lg:h-fit">
          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className="text-2xl font-bold text-ink">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <>
                  <span className="text-sm text-ink-faint line-through">{formatPrice(product.oldPrice)}</span>
                  {discount !== null && (
                    <span className="rounded-md bg-danger px-1.5 py-0.5 text-xs font-bold text-white">−{discount}%</span>
                  )}
                </>
              )}
            </div>

            {product.price >= 200000 && (
              <p className="mt-2 rounded-lg bg-surface-soft px-3 py-2 text-xs text-ink-muted">
                Muddatli to‘lov: <span className="font-semibold text-ink">{formatPrice(monthlyInstalment(product.price))}/oy</span>{' '}
                × 12 oy
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <AddToCartButton product={product} variant="full" className="flex-1" />
              <WishlistButton productId={product.id} size="lg" className="shrink-0 border-line-strong" />
            </div>

            <ul className="mt-5 space-y-3 border-t border-line pt-4 text-[13px]">
              <li className="flex gap-2.5">
                <IconTruck className="h-5 w-5 shrink-0 text-brand-600" />
                <span>
                  <span className="block font-medium text-ink">Toshkent bo‘ylab 2 soatda</span>
                  <span className="block text-ink-muted">
                    {formatPrice(freeDeliveryFrom)} dan yuqori xaridlarda bepul
                  </span>
                </span>
              </li>
              <li className="flex gap-2.5">
                <IconBox className="h-5 w-5 shrink-0 text-brand-600" />
                <span>
                  <span className="block font-medium text-ink">Viloyatlarga 1–3 kun</span>
                  <span className="block text-ink-muted">Butun O‘zbekiston bo‘ylab</span>
                </span>
              </li>
              <li className="flex gap-2.5">
                <IconRefresh className="h-5 w-5 shrink-0 text-brand-600" />
                <span>
                  <span className="block font-medium text-ink">14 kun ichida qaytarish</span>
                  <span className="block text-ink-muted">Tovar ko‘rinishi saqlangan bo‘lsa</span>
                </span>
              </li>
              <li className="flex gap-2.5">
                <IconShield className="h-5 w-5 shrink-0 text-brand-600" />
                <span>
                  <span className="block font-medium text-ink">Original mahsulot</span>
                  <span className="block text-ink-muted">Rasmiy yetkazib beruvchilardan</span>
                </span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {(reviewsEnabled() || reviews.length > 0) && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-bold text-ink sm:text-xl">Sharhlar</h2>
          <ReviewList reviews={reviews} rating={product.rating} reviewCount={product.reviewCount} />
        </section>
      )}

      <ProductRail title="O‘xshash mahsulotlar" products={similar} />

      <Suspense fallback={null}>
        <RecentlyViewed excludeId={product.id} />
      </Suspense>
    </div>
  )
}
