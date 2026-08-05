import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { CACHE_TAGS } from '@/lib/db/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VALID_TAGS = new Set<string>(Object.values(CACHE_TAGS))

/**
 * On-demand cache invalidation for the storefront.
 *
 * Call this from the Admin Dashboard (or a Supabase database webhook) whenever
 * catalogue data changes, so wookamarket.uz reflects the edit immediately instead
 * of waiting for the 5-minute revalidate window:
 *
 *   POST https://wookamarket.uz/api/revalidate
 *   { "secret": "<REVALIDATE_SECRET>", "tags": ["products", "categories"] }
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'REVALIDATE_SECRET is not configured' }, { status: 500 })
  }

  let body: { secret?: string; tags?: string[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const provided = body.secret ?? request.headers.get('x-revalidate-secret') ?? ''
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 })
  }

  const tags = (body.tags?.length ? body.tags : Object.values(CACHE_TAGS)).filter((t) => VALID_TAGS.has(t))
  if (!tags.length) {
    return NextResponse.json({ ok: false, error: 'No valid tags', valid: [...VALID_TAGS] }, { status: 400 })
  }

  tags.forEach((tag) => revalidateTag(tag))
  return NextResponse.json({ ok: true, revalidated: tags, at: new Date().toISOString() })
}
