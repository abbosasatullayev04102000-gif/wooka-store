/** Canonical domain model. The UI only ever sees these shapes. */

export type ID = string

export interface ProductImage {
  url: string
  alt?: string | null
}

export interface Product {
  id: ID
  name: string
  slug: string | null
  description: string | null
  shortDescription: string | null
  price: number
  oldPrice: number | null
  discountPercent: number
  sku: string | null
  stock: number
  /** The admin stores the category NAME on the product, so this is a name. */
  categoryId: ID | null
  brandId: ID | null
  brandName: string | null
  rating: number
  reviewCount: number
  images: ProductImage[]
  /** Fallback glyph the merchant app assigns to every product. */
  emoji: string
  isActive: boolean
  isFeatured: boolean
  isNew: boolean
  isBestseller: boolean
  salesCount: number
  ageMin: number | null
  ageMax: number | null
  createdAt: string | null
}

export interface Category {
  /** Equals the category name — that is the admin's primary key. */
  id: ID
  name: string
  slug: string | null
  description: string | null
  parentId: ID | null
  image: string | null
  emoji: string
  color: string | null
  position: number
  productCount: number | null
  children?: Category[]
}

export interface Brand {
  id: ID
  name: string
  slug: string | null
  logo: string | null
  description: string | null
  productCount?: number
}

export interface Review {
  id: ID
  productId: ID
  authorName: string
  rating: number
  body: string | null
  createdAt: string | null
}

export interface Banner {
  id: ID
  title: string | null
  subtitle: string | null
  image: string | null
  imageMobile: string | null
  link: string | null
  position: number
}

export interface Promotion {
  id: ID
  title: string
  slug: string | null
  description: string | null
  image: string | null
  discountPercent: number | null
  startsAt: string | null
  endsAt: string | null
}

export type DeliveryMethod = 'courier' | 'pickup' | 'express'
export type PaymentMethod = 'cod' | 'payme' | 'click' | 'uzum'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
/** Matches the admin's ST_KEYS exactly. */
export type OrderStatus = 'new' | 'acc' | 'pack' | 'sent' | 'done' | 'cancel'

export interface OrderItem {
  id: ID
  productId: ID | null
  productName: string
  sku: string | null
  image: string | null
  emoji?: string | null
  price: number
  quantity: number
  total: number
}

export interface Order {
  id: ID
  orderNumber: string
  customerName: string
  phone: string
  email: string | null
  region: string | null
  district: string | null
  address: string | null
  deliveryMethod: DeliveryMethod
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  status: OrderStatus
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  comment: string | null
  createdAt: string | null
  items: OrderItem[]
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

export type SortKey = 'popular' | 'new' | 'price_asc' | 'price_desc' | 'rating' | 'discount'

export interface ProductFilters {
  categoryId?: ID
  categorySlug?: string
  categoryIds?: ID[]
  brandIds?: ID[]
  minPrice?: number
  maxPrice?: number
  ageMin?: number
  ageMax?: number
  inStockOnly?: boolean
  discountedOnly?: boolean
  query?: string
  sort?: SortKey
  page?: number
  pageSize?: number
}

export interface PlaceOrderInput {
  customerName: string
  phone: string
  email?: string | null
  region: string
  district: string
  address: string
  deliveryMethod: DeliveryMethod
  paymentMethod: PaymentMethod
  comment?: string | null
  items: Array<{ productId: ID; quantity: number }>
}

export interface PlaceOrderResult {
  orderId: ID
  orderNumber: string
  total: number
  paymentMethod: PaymentMethod
  paymentUrl?: string | null
}
