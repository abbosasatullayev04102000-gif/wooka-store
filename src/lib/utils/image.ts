import { SCHEMA_CONFIG } from '@/lib/db/schema'

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')

export const PLACEHOLDER_IMAGE = '/img/placeholder-product.svg'

export const isDataUrl = (v: string | null | undefined): boolean => Boolean(v && v.startsWith('data:'))

/**
 * The admin used to persist images as base64 data URLs inside the jsonb blob.
 * `tools/migrate-images.mjs` moves them into Supabase Storage and rewrites the
 * field to a public URL. Both forms are accepted here so the storefront works
 * before, during and after that migration.
 */
export function storageUrl(pathOrUrl: string | null | undefined, bucket = SCHEMA_CONFIG.storageBucket): string {
  if (!pathOrUrl) return PLACEHOLDER_IMAGE
  const value = String(pathOrUrl).trim()
  if (!value) return PLACEHOLDER_IMAGE

  if (isDataUrl(value)) {
    if (!SCHEMA_CONFIG.allowInlineBase64) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[wooka] inline base64 image found — run tools/migrate-images.mjs')
      }
      return PLACEHOLDER_IMAGE
    }
    return value
  }

  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (value.startsWith('/')) return value
  if (!SUPABASE_URL) return PLACEHOLDER_IMAGE

  const clean = value.replace(/^\/+/, '')
  return clean.startsWith(`${bucket}/`)
    ? `${SUPABASE_URL}/storage/v1/object/public/${clean}`
    : `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${clean}`
}

/**
 * next/image cannot run its optimiser over a data: URL, and the local
 * placeholder is already an SVG. Spread this onto <Image> so both cases render
 * instead of throwing.
 */
export function imageProps(url: string): { src: string; unoptimized?: boolean } {
  return isDataUrl(url) || url.endsWith('.svg') ? { src: url, unoptimized: true } : { src: url }
}

/** True when a product has a real picture rather than just its emoji. */
export const hasRealImage = (url: string | null | undefined): boolean =>
  Boolean(url) && url !== PLACEHOLDER_IMAGE

export const BLUR_DATA_URL =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#F0EEF7"/></svg>',
  ).toString('base64')
