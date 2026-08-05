'use server'

import { trackOrder } from '@/lib/db/orders'
import type { Order } from '@/lib/db/types'
import { isValidPhone, normalisePhone } from '@/lib/utils/format'

export type TrackResult = { ok: true; order: Order } | { ok: false; error: string }

export async function lookupOrder(orderNumber: string, phone: string): Promise<TrackResult> {
  const ref = (orderNumber ?? '').trim()
  if (ref.length < 4) return { ok: false, error: 'Buyurtma raqamini kiriting' }
  if (!isValidPhone(phone ?? '')) return { ok: false, error: 'Telefon raqamini to‘liq kiriting' }

  try {
    const order = await trackOrder(ref, normalisePhone(phone))
    if (!order) return { ok: false, error: 'Bunday buyurtma topilmadi. Raqam va telefonni tekshiring.' }
    return { ok: true, order }
  } catch {
    return { ok: false, error: 'Juda ko‘p urinish. Bir necha daqiqadan so‘ng qayta urinib ko‘ring.' }
  }
}
