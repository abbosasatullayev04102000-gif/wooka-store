import { getSupabasePublicClient } from '@/lib/supabase/server'
import { CACHE_TAGS, cached } from './cache'
import { VIEWS } from './schema'
import type { Banner, Promotion } from './types'

/**
 * The merchant app has no banners or promotions tables. Hero slides fall back
 * to the built-in gradient, and /promotions lists discounted products instead.
 * Add tables later and fill these in — every call site tolerates an empty array.
 */
export async function getHeroBanners(): Promise<Banner[]> {
  return []
}

export async function getPromoBanners(): Promise<Banner[]> {
  return []
}

export async function listPromotions(): Promise<Promotion[]> {
  return []
}

// ── Settings ────────────────────────────────────────────────────────────────
// The dashboard keeps its own settings in localStorage, so the storefront owns
// `store_settings` (created by migration 0002). Editing a row there changes the
// delivery fee for real, because place_order() reads the same table.

export type StoreSettings = Record<string, string>

export const getSettings = cached(
  async (): Promise<StoreSettings> => {
    const supabase = getSupabasePublicClient()
    const { data, error } = await supabase.from(VIEWS.settings).select('key,value')
    if (error) {
      if (process.env.NODE_ENV !== 'production') console.warn('[settings]', error.message)
      return {}
    }
    const out: StoreSettings = {}
    for (const row of (data ?? []) as any[]) {
      if (row?.key) out[String(row.key)] = String(row.value ?? '')
    }
    return out
  },
  ['settings:all'],
  [CACHE_TAGS.settings],
  300,
)

export async function getSetting(key: string, fallback = ''): Promise<string> {
  const settings = await getSettings()
  return settings[key] || fallback
}

export async function getContactInfo() {
  const s = await getSettings().catch(() => ({}) as StoreSettings)
  const n = (v: string | undefined, d: number) => {
    const parsed = Number(v)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : d
  }
  return {
    phone: s.support_phone || process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+998 71 200 00 00',
    email: s.support_email || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'info@wooka.online',
    address: s.pickup_address || "Toshkent sh., Amir Temur ko'chasi 1",
    telegram: s.telegram || 'https://t.me/wooka_uz',
    instagram: s.instagram || 'https://instagram.com/wooka.uz',
    workingHours: s.working_hours || 'Dush–Yak, 09:00–21:00',
    freeDeliveryFrom: n(s.free_delivery_from, 300000),
    deliveryFee: n(s.delivery_fee, 25000),
  }
}
