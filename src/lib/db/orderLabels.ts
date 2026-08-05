/** Client-safe label maps. Kept out of orders.ts so Client Components never
 *  pull `next/headers` into the browser bundle.
 *
 *  Status keys mirror the admin dashboard's ST_KEYS exactly, so the two apps
 *  always agree on what an order's state means. */

export const ORDER_STATUS_LABELS: Record<string, { label: string; tone: 'neutral' | 'info' | 'success' | 'danger' }> = {
  new: { label: 'Yangi', tone: 'info' },
  acc: { label: 'Qabul qilingan', tone: 'info' },
  pack: { label: 'Qadoqlangan', tone: 'info' },
  sent: { label: 'Yuborilgan', tone: 'info' },
  done: { label: 'Yetkazib berildi', tone: 'success' },
  cancel: { label: 'Bekor qilingan', tone: 'danger' },
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'To‘lov kutilmoqda',
  paid: 'To‘langan',
  failed: 'To‘lov amalga oshmadi',
  refunded: 'Qaytarilgan',
  cancelled: 'Bekor qilingan',
}

export const DELIVERY_METHOD_LABELS: Record<string, string> = {
  courier: 'Kuryer orqali',
  express: 'Ekspress yetkazib berish',
  pickup: 'Do‘kondan olib ketish',
}
