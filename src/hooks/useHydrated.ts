'use client'

import { useEffect, useState } from 'react'

/**
 * True only after the first client render. Persisted zustand stores read from
 * localStorage, which the server cannot know about — gating on this prevents
 * hydration mismatches on cart/wishlist counters.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  return hydrated
}
