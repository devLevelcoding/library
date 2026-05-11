"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Category, Image, Product, Size } from "@prisma/client"
import ProductCard from "./product-card"

type FullProduct = Product & { images: Image[]; category: Category; size: Size }

interface ProductGridProps {
  initialProducts: FullProduct[]
  categoryId?: string
  pageSize?: number
}

export default function ProductGrid({
  initialProducts,
  categoryId,
  pageSize = 20,
}: ProductGridProps) {
  const [products, setProducts] = useState<FullProduct[]>(initialProducts)
  const [skip, setSkip] = useState(initialProducts.length)
  const [hasMore, setHasMore] = useState(initialProducts.length === pageSize)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)

    const params = new URLSearchParams({
      skip: String(skip),
      take: String(pageSize),
      ...(categoryId ? { categoryId } : {}),
    })

    try {
      const res = await fetch(`/api/products?${params}`)
      const next: FullProduct[] = await res.json()
      setProducts((prev) => [...prev, ...next])
      setSkip((prev) => prev + next.length)
      if (next.length < pageSize) setHasMore(false)
    } catch {
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, skip, pageSize, categoryId])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: "200px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-10">
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={i === 0}
          />
        ))}
      </div>

      {/* sentinel — triggers next load when scrolled into view */}
      <div ref={sentinelRef} className="h-1" />

      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <p className="text-center text-sm text-gray-400 py-8">
          All {products.length} products loaded
        </p>
      )}
    </>
  )
}
