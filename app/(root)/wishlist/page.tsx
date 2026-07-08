"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import useWishlist from "@/hooks/use-wishlist"
import useCart from "@/hooks/use-cart"
import useCurrency from "@/hooks/use-currency"
import { Button } from "@/components/ui/button"
import { WishlistItemCard } from "./wishlist-item-card"

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false)
  const { items, removeItem } = useWishlist()
  const cart = useCart()
  const { currency, rate } = useCurrency()

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 min-h-[60vh]">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-6 w-6 fill-rose-500 text-rose-500" />
        <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
        {items.length > 0 && (
          <span className="text-sm text-muted-foreground">({items.length} book{items.length !== 1 ? "s" : ""})</span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <Heart className="h-16 w-16 text-gray-200" />
          <p className="text-lg font-medium text-gray-500">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground">Browse books and click the heart icon to save them here.</p>
          <Button asChild className="mt-2">
            <Link href="/">Browse books</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map(product => {
            const inCart = cart.items.some(i => i.id === product.id)
            return (
              <WishlistItemCard
                key={product.id}
                product={product}
                inCart={inCart}
                currency={currency}
                rate={rate}
                onToggleCart={() => {
                  if (inCart) {
                    cart.removeItem(product.id)
                  } else {
                    cart.addItem(product as any)
                  }
                }}
                onRemove={() => removeItem(product.id)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
