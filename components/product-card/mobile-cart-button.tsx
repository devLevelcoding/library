import { ShoppingCart, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileCartButtonProps {
  productName: string
  cartHasProduct: boolean
  isOutOfStock: boolean
  onAddToCart: (e: React.MouseEvent) => void
  onRemoveFromCart: (e: React.MouseEvent) => void
}

export function MobileCartButton({ productName, cartHasProduct, isOutOfStock, onAddToCart, onRemoveFromCart }: MobileCartButtonProps) {
  return (
    <div className="flex sm:hidden items-center justify-end">
      {cartHasProduct ? (
        <Button onClick={onRemoveFromCart} className="flex items-center gap-x-2" aria-label={`Remove ${productName} from cart`}>
          Remove from cart <X aria-hidden="true" />
        </Button>
      ) : (
        <Button onClick={onAddToCart} className="flex items-center gap-x-2" aria-label={`Add ${productName} to cart`} disabled={isOutOfStock}>
          Add To Cart <ShoppingCart aria-hidden="true" />
        </Button>
      )}
    </div>
  )
}
