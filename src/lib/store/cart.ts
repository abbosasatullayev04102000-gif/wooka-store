'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product } from '@/lib/db/types'

/**
 * The cart holds a display snapshot only. Price, stock and availability are
 * ALWAYS re-validated server-side by the `place_order` RPC, so a tampered
 * localStorage cart cannot change what a customer is charged.
 */
export interface CartLine {
  productId: string
  name: string
  slug: string | null
  image: string | null
  emoji: string
  price: number
  oldPrice: number | null
  /** Stock at the time of adding — used only to cap the quantity stepper. */
  stock: number
  quantity: number
}

interface CartState {
  lines: CartLine[]
  hydrated: boolean
  add: (product: Product, quantity?: number) => void
  remove: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  increment: (productId: string) => void
  decrement: (productId: string) => void
  clear: () => void
  has: (productId: string) => boolean
  quantityOf: (productId: string) => number
}

const MAX_PER_LINE = 99

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      hydrated: false,

      add: (product, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === product.id)
          const cap = Math.max(1, Math.min(product.stock || MAX_PER_LINE, MAX_PER_LINE))

          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productId === product.id ? { ...l, quantity: Math.min(cap, l.quantity + quantity) } : l,
              ),
            }
          }

          const line: CartLine = {
            productId: product.id,
            name: product.name,
            slug: product.slug,
            image: product.images[0]?.url ?? null,
            emoji: product.emoji || '🧸',
            price: product.price,
            oldPrice: product.oldPrice,
            stock: product.stock,
            quantity: Math.min(cap, Math.max(1, quantity)),
          }
          return { lines: [...state.lines, line] }
        }),

      remove: (productId) => set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) })),

      setQuantity: (productId, quantity) =>
        set((s) => ({
          lines:
            quantity <= 0
              ? s.lines.filter((l) => l.productId !== productId)
              : s.lines.map((l) =>
                  l.productId === productId
                    ? { ...l, quantity: Math.min(Math.max(1, quantity), Math.min(l.stock || MAX_PER_LINE, MAX_PER_LINE)) }
                    : l,
                ),
        })),

      increment: (productId) => {
        const line = get().lines.find((l) => l.productId === productId)
        if (line) get().setQuantity(productId, line.quantity + 1)
      },

      decrement: (productId) => {
        const line = get().lines.find((l) => l.productId === productId)
        if (line) get().setQuantity(productId, line.quantity - 1)
      },

      clear: () => set({ lines: [] }),
      has: (productId) => get().lines.some((l) => l.productId === productId),
      quantityOf: (productId) => get().lines.find((l) => l.productId === productId)?.quantity ?? 0,
    }),
    {
      name: 'wooka-cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }) as unknown as CartState,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true
      },
    },
  ),
)

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0)
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.price * l.quantity, 0)
export const cartSavings = (lines: CartLine[]) =>
  lines.reduce((n, l) => n + (l.oldPrice && l.oldPrice > l.price ? (l.oldPrice - l.price) * l.quantity : 0), 0)
