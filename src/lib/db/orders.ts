import { getSupabasePublicClient, getSupabaseServerClient } from '@/lib/supabase/server'
import { mapOrder } from './mappers'
import { RPC } from './schema'
import type { Order, PlaceOrderInput, PlaceOrderResult } from './types'

/**
 * Creates an order through the `place_order` RPC.
 *
 * The RPC is the ONLY write path a customer has. It runs as SECURITY DEFINER
 * and, in one transaction, locks each product row, verifies stock, decrements
 * `data.stock`, bumps `data.sold`, and inserts an order whose jsonb shape is
 * exactly what the admin dashboard's own saveOrder() produces — so the order
 * appears in wooka.online instantly via the existing Realtime channel,
 * with a printable receipt and correct statistics, and no changes to it.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.rpc(RPC.placeOrder, {
    p_customer_name: input.customerName,
    p_phone: input.phone,
    p_email: input.email ?? null,
    p_region: input.region,
    p_district: input.district,
    p_address: input.address,
    p_delivery_method: input.deliveryMethod,
    p_payment_method: input.paymentMethod,
    p_comment: input.comment ?? null,
    p_items: input.items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
  })

  if (error) throw new OrderError(translateRpcError(error.message), error.message)

  const row = Array.isArray(data) ? data[0] : data
  if (!row) throw new OrderError('Buyurtma yaratilmadi. Qayta urinib ko‘ring.', 'empty rpc result')

  return {
    orderId: String(row.order_id ?? row.order_number),
    orderNumber: String(row.order_number ?? row.order_id),
    total: Number(row.total ?? 0),
    paymentMethod: input.paymentMethod,
    paymentUrl: null,
  }
}

export class OrderError extends Error {
  constructor(
    message: string,
    public readonly detail?: string,
  ) {
    super(message)
    this.name = 'OrderError'
  }
}

/** Maps RAISE messages from the RPC to customer-facing Uzbek text. */
function translateRpcError(raw: string): string {
  const m = (raw || '').toLowerCase()
  if (m.includes('out_of_stock')) {
    const name = raw.split('out_of_stock:')[1]?.split(':')[0]?.trim()
    return name
      ? `Afsuski, "${name}" omborda tugadi. Savatni yangilang.`
      : 'Afsuski, tanlangan mahsulotlardan biri omborda tugadi. Savatni yangilang.'
  }
  if (m.includes('product_not_found') || m.includes('product_inactive')) {
    return 'Mahsulotlardan biri endi mavjud emas. Savatdan olib tashlang.'
  }
  if (m.includes('empty_cart')) return 'Savat bo‘sh.'
  if (m.includes('cart_too_large')) return 'Savatda juda ko‘p mahsulot turi bor (maksimum 50 ta).'
  if (m.includes('invalid_phone')) return 'Telefon raqami noto‘g‘ri kiritilgan.'
  if (m.includes('invalid_name')) return 'Ism va familiyani kiriting.'
  if (m.includes('invalid_address')) return 'Yetkazib berish manzilini kiriting.'
  if (m.includes('does not exist') || m.includes('schema cache')) {
    return 'Buyurtma xizmati hali sozlanmagan. Administrator SQL migratsiyalarni ishga tushirishi kerak.'
  }
  return 'Buyurtmani rasmiylashtirishda xatolik yuz berdi. Qayta urinib ko‘ring.'
}

/**
 * Guest order lookup. Goes through the `track_order` RPC so a customer can only
 * see an order when they know BOTH the check number and the phone it was placed
 * with; the phone comes back masked and lookups are rate-limited.
 */
export async function trackOrder(orderNumber: string, phone: string): Promise<Order | null> {
  const supabase = getSupabasePublicClient()
  const { data, error } = await supabase.rpc(RPC.trackOrder, {
    p_order_number: orderNumber.trim(),
    p_phone: phone.trim(),
  })
  if (error) {
    if (process.env.NODE_ENV !== 'production') console.warn('[orders.track]', error.message)
    if ((error.message || '').includes('too_many_attempts')) throw new Error('too_many_attempts')
    return null
  }
  const row = Array.isArray(data) ? data[0] : data
  return row ? mapOrder(row) : null
}

/**
 * Signed-in order history. The merchant schema keys customers by phone and has
 * no link to auth.users, so history is only reachable once phone login ships;
 * until then the storefront uses guest tracking. Returning an empty list keeps
 * every call site working.
 */
export async function getMyOrders(): Promise<Order[]> {
  return []
}

export async function getMyOrderById(id: string): Promise<Order | null> {
  const orders = await getMyOrders()
  return orders.find((o) => o.id === id || o.orderNumber === id) ?? null
}

export { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, DELIVERY_METHOD_LABELS } from './orderLabels'
