"use client"

import { Category, Image, Product, Size } from "@prisma/client"
import { FilterPanel } from "./filter-panel"
import { ImageLoadingBar } from "./product-grid/image-loading-bar"
import { PageBar } from "./product-grid/page-bar"
import { ProductPages } from "./product-grid/product-pages"
import { useProductGrid } from "@/hooks/use-product-grid"

interface TagRef { id: string; name: string; slug: string; color: string; group: string }
type FullProduct = Product & { images: Image[]; category: Category; size: Size; tags?: { tag: TagRef }[] }

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
  availableTags?: TagRef[]
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
  availableTags = [],
}: ProductGridProps) {
  const {
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
  } = useProductGrid({ initialProducts, categoryId, categoryIds, pageSize, initialTotal })

  const showFilters = subcategories.length > 0 || absoluteMinPrice !== absoluteMaxPrice || availableTags.length > 0

  return (
    <div className="relative">
      {showImageBar && (
        <ImageLoadingBar settledCount={settledCount} totalImages={totalImages} progress={imageProgress} />
      )}

      {showFilters && (
        <FilterPanel
          absoluteMin={absoluteMinPrice}
          absoluteMax={absoluteMaxPrice}
          subcategories={subcategories}
          defaultCategoryIds={defaultCategoryIds}
          availableTags={availableTags}
          onApply={handleApplyFilters}
        />
      )}

      <ProductPages pages={pages} pageMarkerRefs={pageMarkerRefs} onImageSettled={handleImageSettled} />

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
