import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export function assertSupabaseEnv() {
  if (!url || !anonKey) {
    throw new Error(
      'Supabase env missing. Copy .env.example to .env.local and fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from the existing WOOKA project.',
    )
  }
}

/**
 * Request-scoped client that carries the customer's auth cookies.
 * Use inside Server Components, Route Handlers and Server Actions.
 */
export async function getSupabaseServerClient() {
  assertSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as never))
        } catch {
          // Called from a Server Component — middleware refreshes the session instead.
        }
      },
    },
    auth: { storageKey: 'wooka-store-auth' },
    global: { headers: { 'x-wooka-client': 'store' } },
  })
}

/**
 * Cookie-free anonymous client for cached, public catalogue reads
 * (products, categories, banners). Safe to use in `generateStaticParams`
 * and statically rendered pages because it never touches request headers.
 */
export function getSupabasePublicClient() {
  assertSupabaseEnv()
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-wooka-client': 'store-public' } },
  })
}

/**
 * Service-role client. NEVER import this from a Client Component.
 * Only used by payment reconciliation route handlers where RLS must be bypassed.
 */
export function getSupabaseServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
