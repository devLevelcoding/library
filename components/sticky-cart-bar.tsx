"use client"

import { useEffect, useRef, useState } from "react"
import { ShoppingCart, X } from "lucide-react"
import Image from "next/image"
import { Button } from "./ui/button"
import { formatPrice } from "@/lib/utils"
import useCurrency from "@/hooks/use-currency"
import useCart from "@/hooks/use-cart"
import { BookVariant, variantPrice } from "@/lib/variants"

interface StickyCartBarProps {
  product: {
    id: string
    name: string
    price: number
    image?: string
  }
  selectedVariant: BookVariant
  /** ref to the main Add-to-Cart button — bar shows when it's off screen */
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

export function StickyCartBar({ product, selectedVariant, triggerRef }: StickyCartBarProps) {
  const [visible, setVisible] = useState(false)
  const { currency, rate } = useCurrency()
  const cart = useCart()

  const finalPrice = variantPrice(product.price, selectedVariant.multiplier)
  const inCart = cart.items.find(i => i.id === product.id && i.variantLabel === selectedVariant.format)

  useEffect(() => {
    const el = triggerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-64px 0px 0px 0px" } // account for fixed navbar height
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [triggerRef])

  if (!visible) return null

  const handleCart = () => {
    if (inCart) {
      cart.removeItem(product.id, selectedVariant.format)
    } else {
      cart.addItem({ id: product.id, name: product.name, price: product.price } as any, selectedVariant.format, finalPrice)
    }
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b shadow-md animate-in slide-in-from-top-2 duration-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* thumbnail */}
        {product.image && (
          <div className="relative h-10 w-10 rounded overflow-hidden shrink-0 bg-muted">
            <Image src={product.image} alt={product.name} fill className="object-cover" />
          </div>
        )}

        {/* title + variant */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground">{selectedVariant.icon} {selectedVariant.format}</p>
        </div>

        {/* price */}
        <span className="text-base font-bold shrink-0">{formatPrice(finalPrice, currency, rate)}</span>

        {/* button */}
        <Button size="sm" onClick={handleCart} className="shrink-0 gap-1.5">
          {inCart
            ? <><X className="h-4 w-4" /> Remove</>
            : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>
          }
        </Button>
      </div>
    </div>
  )
}
