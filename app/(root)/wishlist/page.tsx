"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import NextImage from "next/image"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import useWishlist from "@/hooks/use-wishlist"
import useCart from "@/hooks/use-cart"
import useCurrency from "@/hooks/use-currency"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
              <div key={product.id} className="group flex flex-col rounded-xl border bg-white overflow-hidden hover:shadow-md transition-shadow">
                <Link href={`/product/${product.id}`} className="relative aspect-[2/3] bg-gray-100 overflow-hidden">
                  {product.image ? (
                    <NextImage
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200">📖</div>
                  )}
                </Link>

                <div className="flex flex-col gap-2 p-3 flex-1">
                  <div className="flex-1">
                    <Link href={`/product/${product.id}`}>
                      <p className="font-semibold text-sm text-gray-900 line-clamp-2 hover:underline leading-snug">
                        {product.name}
                      </p>
                    </Link>
                    {product.author && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{product.author}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {formatPrice(product.price, currency, rate)}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (inCart) {
                          cart.removeItem(product.id)
                        } else {
                          cart.addItem(product as any)
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium border transition-colors ${
                        inCart
                          ? "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
                          : "border-primary bg-primary text-primary-foreground hover:opacity-90"
                      }`}
                    >
                      <ShoppingCart className="h-3 w-3" />
                      {inCart ? "In cart" : "Add to cart"}
                    </button>
                    <button
                      onClick={() => removeItem(product.id)}
                      aria-label="Remove from wishlist"
                      className="flex items-center justify-center rounded-md border border-gray-200 px-2 py-1.5 text-gray-400 hover:text-rose-500 hover:border-rose-200 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
