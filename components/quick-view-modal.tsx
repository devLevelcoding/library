"use client"

import { X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { BOOK_VARIANTS, BookVariant, variantPrice } from "@/lib/variants"
import useCurrency from "@/hooks/use-currency"
import useCart from "@/hooks/use-cart"
import { QuickViewDetails } from "./quick-view-modal/quick-view-details"

export interface QuickViewProduct {
  id: string
  name: string
  price: number
  author?: string | null
  category: string
  image?: string
  tags?: { tag: { name: string; color: string } }[]
}

interface QuickViewModalProps {
  product: QuickViewProduct
  onClose: () => void
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<BookVariant>(BOOK_VARIANTS[0])
  const { currency, rate } = useCurrency()
  const cart = useCart()

  const finalPrice = variantPrice(product.price, selectedVariant.multiplier)
  const inCart = cart.items.find(i => i.id === product.id && i.variantLabel === selectedVariant.format)

  const handleCart = () => {
    if (inCart) {
      cart.removeItem(product.id, selectedVariant.format)
    } else {
      cart.addItem({ id: product.id, name: product.name, price: product.price } as any, selectedVariant.format, finalPrice)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors">
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-52 shrink-0 bg-muted aspect-[3/4] sm:aspect-auto">
            {product.image ? (
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No cover</div>
            )}
          </div>

          <QuickViewDetails
            product={product}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
            finalPrice={finalPrice}
            currency={currency}
            rate={rate}
            inCart={!!inCart}
            onToggleCart={handleCart}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  )
}
