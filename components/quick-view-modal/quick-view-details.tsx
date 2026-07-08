import Link from "next/link"
import { ExternalLink, ShoppingCart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VariantSelector } from "@/components/variant-selector"
import { BookVariant } from "@/lib/variants"
import { formatPrice } from "@/lib/utils"
import { QuickViewProduct } from "../quick-view-modal"

interface QuickViewDetailsProps {
  product: QuickViewProduct
  selectedVariant: BookVariant
  onVariantChange: (v: BookVariant) => void
  finalPrice: number
  currency: string
  rate: number
  inCart: boolean
  onToggleCart: () => void
  onClose: () => void
}

export function QuickViewDetails({
  product, selectedVariant, onVariantChange, finalPrice, currency, rate, inCart, onToggleCart, onClose,
}: QuickViewDetailsProps) {
  return (
    <div className="flex flex-col gap-4 p-6 flex-1 min-w-0">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{product.category}</p>
        <h2 className="text-xl font-bold leading-snug">{product.name}</h2>
        {product.author && <p className="text-sm text-muted-foreground mt-1">by {product.author}</p>}
      </div>

      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {product.tags.slice(0, 5).map(({ tag }) => (
            <span key={tag.name} className="text-[10px] font-medium rounded-full px-2 py-0.5 text-white"
              style={{ backgroundColor: tag.color }}>{tag.name}</span>
          ))}
        </div>
      )}

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{formatPrice(finalPrice, currency, rate)}</span>
        {selectedVariant.multiplier !== 1 && (
          <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price, currency, rate)}</span>
        )}
      </div>

      <VariantSelector basePrice={product.price} selected={selectedVariant} onChange={onVariantChange} />

      <div className="flex gap-2 mt-auto">
        <Button className="flex-1 gap-2" onClick={onToggleCart}>
          {inCart ? <><X className="h-4 w-4" /> Remove</> : <><ShoppingCart className="h-4 w-4" /> Add {selectedVariant.format}</>}
        </Button>
        <Button variant="outline" asChild onClick={onClose}>
          <Link href={`/product/${product.id}`} className="flex items-center gap-1.5">
            <ExternalLink className="h-4 w-4" /> Details
          </Link>
        </Button>
      </div>
    </div>
  )
}
