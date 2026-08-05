'use client'

import { createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let cached: ReturnType<typeof createBrowserClient> | null = null

/**
 * Browser Supabase client — the SAME project as wooka.online.
 * Uses a distinct storage key so a customer session can never collide with an
 * admin session in the same browser.
 */
export function getSupabaseBrowserClient() {
  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  if (cached) return cached
  cached = createBrowserClient(url, anonKey, {
    auth: {
      storageKey: 'wooka-store-auth',
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: { 'x-wooka-client': 'store' },
    },
  })
  return cached
}
