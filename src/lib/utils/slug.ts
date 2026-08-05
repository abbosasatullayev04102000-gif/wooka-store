const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
  э: 'e', ю: 'yu', я: 'ya', ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h',
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’`]/g, '')
    .split('')
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}

/**
 * Product URLs are `/p/<slug>-<id>` so a renamed product never 404s and we can
 * always resolve the row by id without an extra lookup.
 */
export function productHref(product: { id: string | number; slug?: string | null; name: string }): string {
  const base = product.slug?.trim() || slugify(product.name)
  return `/p/${base ? `${base}-` : ''}${product.id}`
}

export function idFromSlug(slugWithId: string): string {
  const parts = slugWithId.split('-')
  return parts[parts.length - 1] ?? slugWithId
}

export function categoryHref(category: { slug?: string | null; id: string | number }): string {
  return `/c/${category.slug?.trim() || category.id}`
}

export function brandHref(brand: { slug?: string | null; id: string | number }): string {
  return `/brands/${brand.slug?.trim() || brand.id}`
}
