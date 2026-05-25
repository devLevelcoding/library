"use client"

import { X } from "lucide-react"
import Image from "next/image"
import useCompare from "@/hooks/use-compare"
import { formatPrice } from "@/lib/utils"
import useCurrency from "@/hooks/use-currency"
import { Button } from "./ui/button"
import useCart from "@/hooks/use-cart"

interface Props { onClose: () => void }

const ROW_LABELS = ["Author", "Category", "Price", "Tags"]

export function CompareModal({ onClose }: Props) {
  const { items, removeItem } = useCompare()
  const { currency, rate } = useCurrency()
  const cart = useCart()

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">Compare Books</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* book covers + names */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}>
            <div />
            {items.map(item => (
              <div key={item.id} className="flex flex-col items-center gap-2 relative">
                <button onClick={() => removeItem(item.id)}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-destructive hover:text-white transition-colors">
                  <X className="h-3 w-3" />
                </button>
                <div className="relative h-32 w-24 rounded-lg overflow-hidden border bg-muted">
                  {item.image
                    ? <Image src={item.image} alt={item.name} fill className="object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No cover</div>
                  }
                </div>
                <p className="text-sm font-semibold text-center leading-tight line-clamp-2">{item.name}</p>
              </div>
            ))}
          </div>

          {/* comparison rows */}
          <div className="mt-6 divide-y border rounded-xl overflow-hidden">
            {/* Author */}
            <div className="grid items-center" style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/40">Author</div>
              {items.map(item => (
                <div key={item.id} className="px-4 py-3 text-sm">{(item as any).author || "—"}</div>
              ))}
            </div>
            {/* Category */}
            <div className="grid items-center" style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/40">Category</div>
              {items.map(item => (
                <div key={item.id} className="px-4 py-3 text-sm">{item.category}</div>
              ))}
            </div>
            {/* Price */}
            <div className="grid items-center" style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/40">Price</div>
              {items.map(item => {
                const prices = items.map(i => i.price)
                const lowest = Math.min(...prices)
                return (
                  <div key={item.id} className="px-4 py-3 text-sm font-semibold">
                    <span className={item.price === lowest ? "text-green-600" : ""}>
                      {formatPrice(item.price, currency, rate)}
                    </span>
                    {item.price === lowest && items.length > 1 && (
                      <span className="ml-1 text-[10px] font-medium bg-green-100 text-green-700 rounded px-1">Best</span>
                    )}
                  </div>
                )
              })}
            </div>
            {/* Tags */}
            <div className="grid items-start" style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/40">Tags</div>
              {items.map(item => (
                <div key={item.id} className="px-4 py-3 flex flex-wrap gap-1">
                  {item.tags?.slice(0, 4).map(({ tag }) => (
                    <span key={tag.name} className="text-[10px] font-medium rounded-full px-2 py-0.5 text-white" style={{ backgroundColor: tag.color }}>
                      {tag.name}
                    </span>
                  )) ?? <span className="text-sm text-muted-foreground">—</span>}
                </div>
              ))}
            </div>
          </div>

          {/* add to cart row */}
          <div className="grid mt-4 gap-4" style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}>
            <div />
            {items.map(item => {
              const inCart = cart.items.find(c => c.id === item.id)
              return (
                <Button key={item.id} size="sm" variant={inCart ? "outline" : "default"}
                  onClick={() => inCart ? cart.removeItem(item.id) : cart.addItem(item as any)}>
                  {inCart ? "Remove from cart" : "Add to cart"}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
