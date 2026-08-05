'use server'

import { OrderError, placeOrder } from '@/lib/db/orders'
import type { DeliveryMethod, PaymentMethod, PlaceOrderInput } from '@/lib/db/types'
import { isValidPhone, normalisePhone } from '@/lib/utils/format'
import { districtsOf, REGION_NAMES } from '@/lib/constants/regions'
import { buildPaymentRedirect } from '@/lib/payments'
import { absoluteUrl } from '@/lib/utils/seo'

export interface CheckoutPayload {
  customerName: string
  phone: string
  email?: string
  region: string
  district: string
  address: string
  deliveryMethod: DeliveryMethod
  paymentMethod: PaymentMethod
  comment?: string
  items: Array<{ productId: string; quantity: number }>
}

export type CheckoutResult =
  | { ok: true; orderNumber: string; orderId: string; total: number; paymentUrl: string | null }
  | { ok: false; error: string; field?: keyof CheckoutPayload }

const DELIVERY_METHODS: DeliveryMethod[] = ['courier', 'pickup', 'express']
const PAYMENT_METHODS: PaymentMethod[] = ['cod', 'payme', 'click', 'uzum']

/**
 * Server-side checkout. Everything is re-validated here and again inside the
 * `place_order` RPC — the client is never trusted for prices, stock or totals.
 */
export async function submitCheckout(payload: CheckoutPayload): Promise<CheckoutResult> {
  const name = payload.customerName?.trim() ?? ''
  if (name.length < 2) return { ok: false, error: 'Ism va familiyani kiriting', field: 'customerName' }

  if (!isValidPhone(payload.phone ?? '')) {
    return { ok: false, error: 'Telefon raqamini to‘liq kiriting: +998 XX XXX XX XX', field: 'phone' }
  }

  if (!DELIVERY_METHODS.includes(payload.deliveryMethod)) {
    return { ok: false, error: 'Yetkazib berish usulini tanlang', field: 'deliveryMethod' }
  }

  if (!PAYMENT_METHODS.includes(payload.paymentMethod)) {
    return { ok: false, error: 'To‘lov usulini tanlang', field: 'paymentMethod' }
  }

  if (payload.deliveryMethod !== 'pickup') {
    if (!REGION_NAMES.includes(payload.region)) {
      return { ok: false, error: 'Viloyatni tanlang', field: 'region' }
    }
    const districts = districtsOf(payload.region)
    if (districts.length && !districts.includes(payload.district)) {
      return { ok: false, error: 'Tumanni tanlang', field: 'district' }
    }
    if ((payload.address ?? '').trim().length < 5) {
      return { ok: false, error: 'To‘liq manzilni kiriting', field: 'address' }
    }
  }

  const items = (payload.items ?? [])
    .filter((i) => i?.productId && Number.isFinite(i.quantity) && i.quantity > 0)
    .map((i) => ({ productId: String(i.productId), quantity: Math.min(99, Math.trunc(i.quantity)) }))

  if (!items.length) return { ok: false, error: 'Savat bo‘sh', field: 'items' }

  const input: PlaceOrderInput = {
    customerName: name,
    phone: normalisePhone(payload.phone),
    email: payload.email?.trim() || null,
    region: payload.deliveryMethod === 'pickup' ? 'Toshkent shahri' : payload.region,
    district: payload.deliveryMethod === 'pickup' ? 'Chilonzor' : payload.district,
    address: payload.deliveryMethod === 'pickup' ? 'Do‘kondan olib ketish' : payload.address.trim(),
    deliveryMethod: payload.deliveryMethod,
    paymentMethod: payload.paymentMethod,
    comment: payload.comment?.trim() || null,
    items,
  }

  try {
    const result = await placeOrder(input)

    const paymentUrl = buildPaymentRedirect(payload.paymentMethod, {
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      amount: result.total,
      returnUrl: absoluteUrl(`/checkout/success/${encodeURIComponent(result.orderNumber)}`),
    })

    return {
      ok: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      total: result.total,
      paymentUrl: result.paymentUrl ?? paymentUrl,
    }
  } catch (e) {
    if (e instanceof OrderError) return { ok: false, error: e.message }
    return { ok: false, error: 'Kutilmagan xatolik. Qayta urinib ko‘ring yoki biz bilan bog‘laning.' }
  }
}
