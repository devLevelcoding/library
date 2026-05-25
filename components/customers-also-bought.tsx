"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import NextImage from "next/image"
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import useCurrency from "@/hooks/use-currency"
import useCart from "@/hooks/use-cart"

interface RecProduct {
  id: string
  name: string
  price: number | string | { toString(): string }
  images: { url: string }[]
  category: { name: string }
  [key: string]: any
}

interface CustomersAlsoBoughtProps {
  productId: string
}

export function CustomersAlsoBought({ productId }: CustomersAlsoBoughtProps) {
  const [items, setItems] = useState<RecProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const { currency, rate } = useCurrency()
  const cart = useCart()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    fetch(`/api/recommendations?productId=${productId}&limit=8`)
      .then(r => r.json())
      .then(data => setItems(data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [productId])

  const scroll = (dir: "left" | "right") => {
    if (!trackRef.current) return
    const w = trackRef.current.clientWidth
    trackRef.current.scrollBy({ left: dir === "left" ? -(w / 2) : w / 2, behavior: "smooth" })
  }

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
          const price = Number(product.price)
          const imageUrl = product.images?.[0]?.url ?? ""
          const inCart = mounted && cart.items.some(i => i.id === product.id)

          return (
            <div
              key={product.id}
              className="flex-none w-[160px] sm:w-[180px] snap-start group flex flex-col"
            >
              <Link href={`/product/${product.id}`} className="block">
                <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-gray-100 mb-2">
                  {imageUrl ? (
                    <NextImage
                      src={imageUrl}
                      alt={product.name}
                      fill
                      sizes="180px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">📖</div>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">{product.name}</p>
                {product.author && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{product.author}</p>
                )}
                <p className="text-xs font-medium text-gray-800 mt-1">
                  {formatPrice(price, currency, rate)}
                </p>
              </Link>

              <button
                onClick={() => {
                  if (inCart) {
                    cart.removeItem(product.id)
                  } else {
                    cart.addItem(product as any)
                  }
                }}
                className={`mt-2 w-full flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                  inCart
                    ? "border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
                    : "border-primary bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                <ShoppingCart className="h-3 w-3" />
                {inCart ? "In cart" : "Add to cart"}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
