"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import NextImage from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import useRecentlyViewed from "@/hooks/use-recently-viewed"
import { formatPrice } from "@/lib/utils"
import useCurrency from "@/hooks/use-currency"

interface RecentlyViewedProps {
  excludeId?: string   // hide the product currently being viewed
}

export function RecentlyViewed({ excludeId }: RecentlyViewedProps) {
  const [mounted, setMounted] = useState(false)
  const { items } = useRecentlyViewed()
  const { currency, rate } = useCurrency()
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const visible = items.filter(i => i.id !== excludeId)
  if (visible.length === 0) return null

  const scroll = (dir: "left" | "right") => {
    if (!trackRef.current) return
    const width = trackRef.current.clientWidth
    trackRef.current.scrollBy({ left: dir === "left" ? -width / 2 : width / 2, behavior: "smooth" })
  }

  return (
    <section className="mt-12" aria-labelledby="recently-viewed-heading">
      <div className="flex items-center justify-between mb-4">
        <h2 id="recently-viewed-heading" className="text-xl font-bold text-gray-900">
          Recently Viewed
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
        {visible.map(product => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="flex-none w-[140px] sm:w-[160px] snap-start group"
          >
            <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-gray-100 mb-2">
              {product.image ? (
                <NextImage
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="160px"
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
              {formatPrice(product.price, currency, rate)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
