'use client'

import { useEffect } from 'react'
import { useRecentlyViewed } from '@/lib/store/recentlyViewed'

/** Records a product view in localStorage. Renders nothing. */
export function TrackView({ productId }: { productId: string }) {
  const push = useRecentlyViewed((s) => s.push)
  useEffect(() => {
    push(productId)
  }, [productId, push])
  return null
}
