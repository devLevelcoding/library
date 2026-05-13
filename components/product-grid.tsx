"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Category, Image, Product, Size } from "@prisma/client"
import ProductCard from "./product-card"
import { FilterPanel, FilterState } from "./filter-panel"

type FullProduct = Product & { images: Image[]; category: Category; size: Size }

interface Subcategory { id: string; name: string }

interface ProductGridProps {
  initialProducts: FullProduct[]
  categoryId?: string
  categoryIds?: string[]        // for group categories
  pageSize?: number
  initialTotal?: number
  absoluteMinPrice?: number
  absoluteMaxPrice?: number
  subcategories?: Subcategory[]
}

export default function ProductGrid({
  initialProducts,
  categoryId,
  categoryIds,
  pageSize = 20,
  initialTotal,
  absoluteMinPrice = 0,
  absoluteMaxPrice = 9999,
  subcategories = [],
}: ProductGridProps) {
  const defaultCategoryIds = categoryIds ?? (categoryId ? [categoryId] : [])

  const [products, setProducts] = useState<FullProduct[]>(initialProducts)
  const [skip, setSkip] = useState(initialProducts.length)
  const [hasMore, setHasMore] = useState(initialProducts.length === pageSize)
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState<number | null>(initialTotal ?? null)
  const [currentPage, setCurrentPage] = useState(0)
  const [filters, setFilters] = useState<FilterState>({
    minPrice: "",
    maxPrice: "",
    categoryIds: defaultCategoryIds,
  })

  const [settledCount, setSettledCount] = useState(0)
  const totalImages = products.filter(p => p.images?.[0]?.url?.startsWith("http")).length
  const imageProgress = totalImages > 0 ? Math.round((settledCount / totalImages) * 100) : 100
  const showBar = settledCount < totalImages

  const sentinelRef = useRef<HTMLDivElement>(null)
  const pageMarkerRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleImageSettled = useCallback(() => setSettledCount(c => c + 1), [])

  const buildParams = useCallback((extraSkip?: number) => {
    const p = new URLSearchParams()
    if (filters.categoryIds.length > 0) p.set("categoryIds", filters.categoryIds.join(","))
    if (filters.minPrice) p.set("minPrice", filters.minPrice)
    if (filters.maxPrice) p.set("maxPrice", filters.maxPrice)
    p.set("skip", String(extraSkip ?? 0))
    p.set("take", String(pageSize))
    return p
  }, [filters, pageSize])

  // reset when filters change
  const handleApplyFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
    setProducts([])
    setSkip(0)
    setHasMore(true)
    setSettledCount(0)
    setTotalCount(null)
    setCurrentPage(0)
  }, [])

  // refetch products when filters change (skip reset triggers this)
  useEffect(() => {
    if (skip !== 0) return  // only on reset
    const params = buildParams(0)
    setLoading(true)
    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then((next: FullProduct[]) => {
        setProducts(next)
        setSkip(next.length)
        setHasMore(next.length === pageSize)
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    // also update total count
    const countParams = new URLSearchParams(params)
    countParams.set("count", "true")
    countParams.delete("skip")
    countParams.delete("take")
    fetch(`/api/products?${countParams}`)
      .then(r => r.json())
      .then(d => setTotalCount(d.count))
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  // fetch count for initial server-provided products (home page)
  useEffect(() => {
    if (initialTotal != null) return
    const timer = setTimeout(() => {
      const p = new URLSearchParams({ count: "true", ...(categoryId ? { categoryIds: categoryId } : {}) })
      fetch(`/api/products?${p}`)
        .then(r => r.json())
        .then(d => setTotalCount(d.count))
        .catch(() => {})
    }, 2000)
    return () => clearTimeout(timer)
  }, [categoryId, initialTotal])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    const params = buildParams(skip)
    try {
      const res = await fetch(`/api/products?${params}`)
      const next: FullProduct[] = await res.json()
      setProducts(prev => [...prev, ...next])
      setSkip(prev => prev + next.length)
      if (next.length < pageSize) setHasMore(false)
    } catch {
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, skip, pageSize, buildParams])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    const markers = pageMarkerRefs.current.slice(0, Math.ceil(products.length / pageSize))
    markers.forEach((el, idx) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setCurrentPage(idx) },
        { rootMargin: "0px 0px -70% 0px" }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [products.length, pageSize])

  const totalPages = totalCount != null ? Math.ceil(totalCount / pageSize) : null
  const loadedPages = Math.ceil(Math.max(products.length, 1) / pageSize)
  const pages = Array.from({ length: loadedPages }, (_, i) =>
    products.slice(i * pageSize, (i + 1) * pageSize)
  )

  const showFilters = subcategories.length > 0 || absoluteMinPrice !== absoluteMaxPrice

  return (
    <div className="relative">
      {/* image loading top bar */}
      {showBar && (
        <div
          className="fixed top-0 left-0 right-0 z-[300] h-[3px] bg-gray-200"
          role="progressbar"
          aria-valuenow={imageProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Images loading"
        >
          <div
            className="h-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${imageProgress}%`, boxShadow: "0 0 8px 0 hsl(var(--primary) / 0.7)" }}
          />
          <div className="absolute right-2 top-1 text-[10px] font-medium text-muted-foreground bg-background/80 px-1 rounded" aria-hidden="true">
            {settledCount} / {totalImages}
          </div>
        </div>
      )}

      {/* filter panel */}
      {showFilters && (
        <FilterPanel
          absoluteMin={absoluteMinPrice}
          absoluteMax={absoluteMaxPrice}
          subcategories={subcategories}
          defaultCategoryIds={defaultCategoryIds}
          onApply={handleApplyFilters}
        />
      )}

      {/* product pages */}
      {pages.map((pageProducts, pageIdx) => (
        <div key={pageIdx}>
          <div ref={el => { pageMarkerRefs.current[pageIdx] = el }} className="h-0" />
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6">
            {pageProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={pageIdx === 0 && i === 0}
                onImageSettled={handleImageSettled}
              />
            ))}
          </div>
        </div>
      ))}

      <div ref={sentinelRef} className="h-1" />

      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <p className="text-center text-sm text-gray-400 py-8">All {products.length} products loaded</p>
      )}

      {totalPages != null && totalPages > 1 && (
        <PageBar currentPage={currentPage} loadedPages={loadedPages} totalPages={totalPages} />
      )}
    </div>
  )
}

function PageBar({ currentPage, loadedPages, totalPages }: { currentPage: number; loadedPages: number; totalPages: number }) {
  const useDots = totalPages <= 15
  const progress = (currentPage + 1) / totalPages

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 select-none">
      <span className="text-xs font-medium text-muted-foreground bg-background/80 backdrop-blur px-1.5 py-0.5 rounded">
        {currentPage + 1} / {totalPages}
      </span>
      {useDots ? (
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-200 ${
              i === currentPage ? "h-3 w-3 bg-gray-900" : i < loadedPages ? "h-2 w-2 bg-gray-400" : "h-2 w-2 bg-gray-200"
            }`} />
          ))}
        </div>
      ) : (
        <div className="relative w-1 h-48 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 w-full bg-gray-300 transition-all duration-300"
            style={{ height: `${(loadedPages / totalPages) * 100}%` }} />
          <div className="absolute left-0 w-full h-1.5 bg-gray-900 rounded-full transition-all duration-300"
            style={{ top: `${progress * 100}%`, transform: "translateY(-50%)" }} />
        </div>
      )}
    </div>
  )
}
