import { Button } from "@/components/ui/button"
import { CompareProduct } from "@/hooks/use-compare"

interface AddToCartRowProps {
  items: CompareProduct[]
  cartItemIds: Set<string>
  onToggleCart: (item: CompareProduct) => void
}

export function AddToCartRow({ items, cartItemIds, onToggleCart }: AddToCartRowProps) {
  return (
    <div className="grid mt-4 gap-4" style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}>
      <div />
      {items.map(item => {
        const inCart = cartItemIds.has(item.id)
        return (
          <Button key={item.id} size="sm" variant={inCart ? "outline" : "default"}
            onClick={() => onToggleCart(item)}>
            {inCart ? "Remove from cart" : "Add to cart"}
          </Button>
        )
      })}
    </div>
  )
}
