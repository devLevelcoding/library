"use client"

import { useEffect, useState } from "react"
import { StockBadge } from "./stock-badge"
import { deriveStock } from "@/lib/stock"

interface StockStatusProps {
  productId: string
}

export function StockStatus({ productId }: StockStatusProps) {
  // Show derived value immediately (no layout shift), replace with real value if available
  const [stock, setStock] = useState(() => deriveStock(productId))

  useEffect(() => {
    fetch(`/api/stock/${productId}`)
      .then(r => r.json())
      .then(d => { if (typeof d.stock === "number") setStock(d.stock) })
      .catch(() => {})
  }, [productId])

  return <StockBadge stock={stock} size="md" />
}
