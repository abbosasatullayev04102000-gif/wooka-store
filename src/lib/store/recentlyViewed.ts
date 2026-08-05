'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const MAX = 20

interface RecentlyViewedState {
  ids: string[]
  push: (productId: string) => void
  clear: () => void
}

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      ids: [],
      push: (id) => set((s) => ({ ids: [id, ...s.ids.filter((x) => x !== id)].slice(0, MAX) })),
      clear: () => set({ ids: [] }),
    }),
    { name: 'wooka-recently-viewed', version: 1, storage: createJSONStorage(() => localStorage) },
  ),
)
