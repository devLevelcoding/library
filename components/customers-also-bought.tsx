"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import useCurrency from "@/hooks/use-currency"
import useCart from "@/hooks/use-cart"
import { useCustomersAlsoBought } from "@/hooks/use-customers-also-bought"
import { RecommendationCard } from "./customers-also-bought/recommendation-card"

interface CustomersAlsoBoughtProps {
  productId: string
}

export function CustomersAlsoBought({ productId }: CustomersAlsoBoughtProps) {
  const { items, loading, mounted, trackRef, scroll } = useCustomersAlsoBought(productId)
  const { currency, rate } = useCurrency()
  const cart = useCart()

  if (loading || items.length === 0) return null

  return (
    <section className="mt-12 px-4 sm:px-6 lg:px-8" aria-labelledby="also-bought-heading">
      <div className="flex items-center justify-between mb-4">
        <h2 id="also-bought-heading" className="text-xl font-bold text-gray-900">
          Customers Also Bought
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="p-1.5 rounded-full border hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="p-1.5 rounded-full border hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map(product => {
          const inCart = mounted && cart.items.some(i => i.id === product.id)
          return (
            <RecommendationCard
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
            />
          )
        })}
      </div>
    </section>
  )
}
