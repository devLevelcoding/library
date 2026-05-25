"use client"

import { useEffect } from "react"
import useRecentlyViewed, { RecentProduct } from "@/hooks/use-recently-viewed"

export function TrackViewed({ product }: { product: RecentProduct }) {
  const addItem = useRecentlyViewed(s => s.addItem)

  useEffect(() => {
    addItem(product)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  return null
}
