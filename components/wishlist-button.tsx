"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import useWishlist, { WishlistProduct } from "@/hooks/use-wishlist"
import { cn } from "@/lib/utils"

interface WishlistButtonProps {
  product: WishlistProduct
  size?: number
  className?: string
  /** show as icon-only pill (card overlay) or with label (product page) */
  variant?: "icon" | "button"
}

export function WishlistButton({ product, size = 16, className, variant = "icon" }: WishlistButtonProps) {
  const [mounted, setMounted] = useState(false)
  const { toggle, hasItem } = useWishlist()

  useEffect(() => { setMounted(true) }, [])

  const saved = mounted && hasItem(product.id)

  if (variant === "button") {
    return (
      <button
        onClick={() => toggle(product)}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        className={cn(
          "flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
          saved
            ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
          className
        )}
      >
        <Heart
          size={16}
          className={saved ? "fill-rose-500 text-rose-500" : "text-gray-500"}
        />
        {saved ? "Saved" : "Save for later"}
      </button>
    )
  }

  return (
    <button
      onClick={e => { e.preventDefault(); toggle(product) }}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={cn(
        "flex items-center justify-center rounded-full p-1.5 border transition-colors",
        saved
          ? "border-rose-300 bg-rose-50 text-rose-500"
          : "border-neutral-300 bg-white/90 text-gray-500 hover:text-rose-500",
        className
      )}
    >
      <Heart
        size={size}
        className={saved ? "fill-rose-500" : ""}
      />
    </button>
  )
}
