import { ArrowLeftRight, Eye, ShoppingCart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WishlistButton } from "@/components/wishlist-button"

interface HoverActionsProps {
  onQuickView: () => void
  cartHasProduct: boolean
  isOutOfStock: boolean
  onAddToCart: (e: React.MouseEvent) => void
  onRemoveFromCart: (e: React.MouseEvent) => void
  inCompare: boolean
  onToggleCompare: () => void
  wishlistProduct: { id: string; name: string; price: number; image: string; category: string; author: any }
}

export function HoverActions({
  onQuickView, cartHasProduct, isOutOfStock, onAddToCart, onRemoveFromCart, inCompare, onToggleCompare, wishlistProduct,
}: HoverActionsProps) {
  return (
    <div className="opacity-0 group-hover:opacity-100 transition absolute w-full px-3 bottom-3">
      <div className="flex items-center justify-center gap-x-1.5">
        <Button
          onClick={e => { e.preventDefault(); onQuickView() }}
          variant="outline"
          className="border-neutral-300 bg-white/90 backdrop-blur-sm text-xs gap-1 px-2"
          aria-label="Quick view"
        >
          <Eye size={14} aria-hidden="true" /> Quick view
        </Button>
        {cartHasProduct ? (
          <Button onClick={onRemoveFromCart} variant="outline" className="border-neutral-300 bg-white/90" aria-label="Remove from cart">
            <X size={16} aria-hidden="true" />
          </Button>
        ) : (
          <Button onClick={onAddToCart} variant="outline" className="border-neutral-300 bg-white/90" aria-label="Add to cart" disabled={isOutOfStock}>
            <ShoppingCart size={16} aria-hidden="true" />
          </Button>
        )}
        <Button
          onClick={e => { e.preventDefault(); onToggleCompare() }}
          variant="outline"
          className={`border-neutral-300 bg-white/90 ${inCompare ? "bg-primary text-primary-foreground border-primary" : ""}`}
          aria-label="Compare"
        >
          <ArrowLeftRight size={16} aria-hidden="true" />
        </Button>
        <WishlistButton product={wishlistProduct} size={16} />
      </div>
    </div>
  )
}
