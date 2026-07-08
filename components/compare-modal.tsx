"use client"

import { X } from "lucide-react"
import useCompare from "@/hooks/use-compare"
import useCurrency from "@/hooks/use-currency"
import useCart from "@/hooks/use-cart"
import { CoversRow } from "./compare-modal/covers-row"
import { ComparisonRows } from "./compare-modal/comparison-rows"
import { AddToCartRow } from "./compare-modal/add-to-cart-row"

interface Props { onClose: () => void }

export function CompareModal({ onClose }: Props) {
  const { items, removeItem } = useCompare()
  const { currency, rate } = useCurrency()
  const cart = useCart()
  const cartItemIds = new Set(cart.items.map(c => c.id))

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">Compare Books</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <CoversRow items={items} onRemove={removeItem} />
          <ComparisonRows items={items} currency={currency} rate={rate} />
          <AddToCartRow
            items={items}
            cartItemIds={cartItemIds}
            onToggleCart={(item) => cartItemIds.has(item.id) ? cart.removeItem(item.id) : cart.addItem(item as any)}
          />
        </div>
      </div>
    </div>
  )
}
