import { useCallback, useEffect, useRef, useState } from "react"
import { Category, Image, Product, Size } from "@prisma/client"
import { FilterState } from "@/components/filter-panel"

interface TagRef { id: string; name: string; slug: string; color: string; group: string }
export type FullProduct = Product & { images: Image[]; category: Category; size: Size; tags?: { tag: TagRef }[] }

interface UseProductGridArgs {
  initialProducts: FullProduct[]
  categoryId?: string
  categoryIds?: string[]
  pageSize: number
  initialTotal?: number
}

export function useProductGrid({ initialProducts, categoryId, categoryIds, pageSize, initialTotal }: UseProductGridArgs) {
  const defaultCategoryIds = categoryIds ?? (categoryId ? [categoryId] : [])

  const [products, setProducts] = useState<FullProduct[]>(initialProducts)
  const [skip, setSkip] = useState(initialProducts.length)
  const [hasMore, setHasMore] = useState(initialProducts.length === pageSize)
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState<number | null>(initialTotal ?? null)
  const [currentPage, setCurrentPage] = useState(0)
  const [filters, setFilters] = useState<FilterState>({
    query: "",
    minPrice: "",
    maxPrice: "",
    categoryIds: defaultCategoryIds,
    tagIds: [],
  })

  const [settledCount, setSettledCount] = useState(0)
  const totalImages = products.filter(p => p.images?.[0]?.url?.startsWith("http")).length
  const imageProgress = totalImages > 0 ? Math.round((settledCount / totalImages) * 100) : 100
  const showImageBar = settledCount < totalImages

  const sentinelRef = useRef<HTMLDivElement>(null)
  const pageMarkerRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleImageSettled = useCallback(() => setSettledCount(c => c + 1), [])

  const buildParams = useCallback((extraSkip?: number) => {
    const p = new URLSearchParams()
    if (filters.categoryIds.length > 0) p.set("categoryIds", filters.categoryIds.join(","))
    if (filters.minPrice) p.set("minPrice", filters.minPrice)
    if (filters.maxPrice) p.set("maxPrice", filters.maxPrice)
    if (filters.query) p.set("q", filters.query)
    if (filters.tagIds.length > 0) p.set("tags", filters.tagIds.join(","))
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
    // scroll back to top so user sees results from the beginning
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  // refetch products when filters change (skip reset triggers this)
  useEffect(() => {
    if (skip !== 0) return  // only on reset
    const params = buildParams(0)
    setLoading(true)
    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then((next: FullProduct[]) => {
        if (!Array.isArray(next)) return
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

  return {
    defaultCategoryIds,
    products,
    loading,
    hasMore,
    totalPages,
    loadedPages,
    pages,
    currentPage,
    settledCount,
    totalImages,
    imageProgress,
    showImageBar,
    sentinelRef,
    pageMarkerRefs,
    handleImageSettled,
    handleApplyFilters,
  }
}
