import { storageUrl } from '@/lib/utils/image'
import { slugify } from '@/lib/utils/slug'
import type { Brand, Category, Order, OrderItem, Product, Review } from './types'

type Row = Record<string, any>

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === 'string' ? Number(v) : (v as number)
  return Number.isFinite(n) ? n : fallback
}
const str = (v: unknown): string | null => {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

/** A row from the `store_products` view. */
export function mapProduct(row: Row): Product {
  const price = num(row.price)
  const oldPrice = num(row.old_price, 0)
  const image = str(row.image)
  const name = str(row.name) ?? 'Mahsulot'
  const updatedAt = str(row.updated_at)

  return {
    id: String(row.id),
    name,
    slug: str(row.slug) ?? slugify(name) ?? null,
    description: str(row.description),
    shortDescription: null,
    price,
    oldPrice: oldPrice > price ? oldPrice : null,
    discountPercent: num(row.discount_percent),
    sku: str(row.sku),
    stock: Math.max(0, Math.trunc(num(row.stock))),
    categoryId: str(row.category_name),
    brandId: str(row.brand),
    brandName: str(row.brand),
    rating: Math.min(5, Math.max(0, num(row.rating))),
    // The merchant app tracks a rating but never stores individual reviews,
    // so we surface the sales count as social proof instead of a fake number.
    reviewCount: 0,
    images: image ? [{ url: storageUrl(image), alt: name }] : [],
    emoji: str(row.emoji) ?? '🧸',
    isActive: str(row.status) !== 'hidden' && str(row.status) !== 'archived',
    isFeatured: num(row.sales_count) > 0 && num(row.rating) >= 4.5,
    // "New" = touched in the last 14 days; the admin has no created_at.
    isNew: updatedAt ? Date.now() - new Date(updatedAt).getTime() < 14 * 864e5 : false,
    isBestseller: num(row.sales_count) >= 10,
    salesCount: Math.max(0, Math.trunc(num(row.sales_count))),
    ageMin: null,
    ageMax: null,
    createdAt: updatedAt,
  }
}

/** A row from the `store_categories` view. Its id IS the category name. */
export function mapCategory(row: Row, position = 0): Category {
  const name = str(row.name) ?? String(row.id)
  return {
    id: String(row.id),
    name,
    slug: str(row.slug) ?? slugify(name),
    description: str(row.description),
    parentId: str(row.parent_name),
    image: row.image ? storageUrl(row.image) : null,
    emoji: str(row.emoji) ?? '🧸',
    color: str(row.color),
    position,
    productCount: row.product_count != null ? num(row.product_count) : null,
  }
}

/** A row from the `store_brands` view. */
export function mapBrand(row: Row): Brand {
  const name = str(row.name) ?? String(row.id)
  return {
    id: String(row.id),
    name,
    slug: str(row.slug) ?? slugify(name),
    logo: null,
    description: null,
    productCount: row.product_count != null ? num(row.product_count) : undefined,
  }
}

export function mapReview(row: Row): Review {
  return {
    id: String(row.id),
    productId: String(row.productId ?? row.product_id ?? ''),
    authorName: str(row.authorName ?? row.author_name) ?? 'Xaridor',
    rating: Math.min(5, Math.max(1, num(row.rating, 5))),
    body: str(row.body),
    createdAt: str(row.createdAt ?? row.created_at),
  }
}

export function mapOrderItem(row: Row, index = 0): OrderItem {
  const price = num(row.price)
  const quantity = Math.max(1, Math.trunc(num(row.quantity ?? row.q, 1)))
  return {
    id: String(row.id ?? row.productId ?? index),
    productId: row.productId != null ? String(row.productId) : null,
    productName: str(row.productName ?? row.n) ?? 'Mahsulot',
    sku: str(row.sku),
    image: row.image ? storageUrl(row.image) : null,
    emoji: str(row.emoji ?? row.e) ?? '🧸',
    price,
    quantity,
    total: num(row.total, price * quantity),
  }
}

/** A row returned by the `track_order` RPC. */
export function mapOrder(row: Row): Order {
  const items: OrderItem[] = Array.isArray(row.items) ? row.items.map(mapOrderItem) : []
  const subtotal = num(row.subtotal, items.reduce((s, i) => s + i.total, 0))
  return {
    id: String(row.id),
    orderNumber: str(row.order_number ?? row.orderNumber) ?? String(row.id),
    customerName: str(row.customer_name ?? row.customerName) ?? '',
    phone: str(row.phone) ?? '',
    email: str(row.email),
    region: str(row.region),
    district: str(row.district),
    address: str(row.address),
    deliveryMethod: (str(row.delivery_method ?? row.deliveryMethod) ?? 'courier') as Order['deliveryMethod'],
    paymentMethod: (str(row.payment_method ?? row.paymentMethod) ?? 'cod') as Order['paymentMethod'],
    paymentStatus: (str(row.payment_status ?? row.paymentStatus) ?? 'pending') as Order['paymentStatus'],
    status: (str(row.status) ?? 'new') as Order['status'],
    subtotal,
    deliveryFee: num(row.delivery_fee ?? row.deliveryFee),
    discount: num(row.discount),
    total: num(row.total, subtotal),
    comment: null,
    createdAt: str(row.created_at ?? row.createdAt),
    items,
  }
}
