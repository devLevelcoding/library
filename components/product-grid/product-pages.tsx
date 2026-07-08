import { MutableRefObject } from "react"
import ProductCard from "../product-card"
import { FullProduct } from "@/hooks/use-product-grid"

interface ProductPagesProps {
  pages: FullProduct[][]
  pageMarkerRefs: MutableRefObject<(HTMLDivElement | null)[]>
  onImageSettled: () => void
}

export function ProductPages({ pages, pageMarkerRefs, onImageSettled }: ProductPagesProps) {
  return (
    <>
      {pages.map((pageProducts, pageIdx) => (
        <div key={pageIdx}>
          <div ref={el => { pageMarkerRefs.current[pageIdx] = el }} className="h-0" />
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6">
            {pageProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={pageIdx === 0 && i < 4}
                onImageSettled={onImageSettled}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
