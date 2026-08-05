import { getSupabasePublicClient } from '@/lib/supabase/server'
import { CACHE_TAGS, cached } from './cache'
import { mapCategory } from './mappers'
import { CATEGORY_FIELDS, VIEWS } from './schema'
import type { Category } from './types'

/**
 * IMPORTANT: in the WOOKA merchant schema a category's identity is its NAME.
 * `categories.id` equals `data->>'n'`, products reference it through
 * `data->>'cat'`, and child categories point at parents by name too.
 * So `Category.id` here is a name, and that is not a bug.
 */
async function listCategoriesUncached(): Promise<Category[]> {
  const supabase = getSupabasePublicClient()
  const { data, error } = await supabase.from(VIEWS.categories).select(CATEGORY_FIELDS).order('name', { ascending: true })
  if (error) throw new Error(`[categories.list] ${error.message}`)
  return (data ?? []).map((row: any, i: number) => mapCategory(row, i))
}

export const listCategories = cached(listCategoriesUncached, ['categories:all'], [CACHE_TAGS.categories])

export const getCategoryTree = cached(
  async (): Promise<Category[]> => {
    const flat = await listCategoriesUncached()
    const byId = new Map(flat.map((c) => [c.id, { ...c, children: [] as Category[] }]))
    const roots: Category[] = []

    for (const cat of byId.values()) {
      const parent = cat.parentId ? byId.get(cat.parentId) : undefined
      if (parent && parent.id !== cat.id) parent.children!.push(cat)
      else roots.push(cat)
    }

    const sort = (list: Category[]) => {
      list.sort((a, b) => a.name.localeCompare(b.name, 'uz'))
      list.forEach((c) => c.children?.length && sort(c.children))
    }
    sort(roots)
    return roots
  },
  ['categories:tree'],
  [CACHE_TAGS.categories],
)

export const getRootCategories = cached(
  async (): Promise<Category[]> => (await getCategoryTree()).slice(),
  ['categories:roots'],
  [CACHE_TAGS.categories],
)

/** Accepts a slug, or the raw category name (which is also the id). */
export async function getCategoryBySlug(slugOrId: string): Promise<Category | null> {
  const all = await listCategories()
  const decoded = decodeURIComponent(slugOrId)
  return (
    all.find((c) => c.slug === slugOrId) ??
    all.find((c) => c.id === decoded) ??
    all.find((c) => c.name.toLowerCase() === decoded.toLowerCase()) ??
    null
  )
}

/** A category plus every descendant name — so a parent page includes children. */
export async function getCategoryBranchIds(categoryId: string): Promise<string[]> {
  const all = await listCategories()
  const childrenOf = new Map<string, string[]>()
  all.forEach((c) => {
    if (!c.parentId) return
    childrenOf.set(c.parentId, [...(childrenOf.get(c.parentId) ?? []), c.id])
  })

  const out: string[] = []
  const seen = new Set<string>()
  const walk = (id: string) => {
    if (seen.has(id)) return // guard against a category being its own ancestor
    seen.add(id)
    out.push(id)
    ;(childrenOf.get(id) ?? []).forEach(walk)
  }
  walk(categoryId)
  return out
}

export async function getCategoryPath(categoryId: string): Promise<Category[]> {
  const all = await listCategories()
  const byId = new Map(all.map((c) => [c.id, c]))
  const path: Category[] = []
  const seen = new Set<string>()
  let current = byId.get(categoryId)
  while (current && !seen.has(current.id)) {
    seen.add(current.id)
    path.unshift(current)
    current = current.parentId ? byId.get(current.parentId) : undefined
  }
  return path
}
