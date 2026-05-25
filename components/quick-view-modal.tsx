"use client"

import { X, ShoppingCart, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "./ui/button"
import { VariantSelector } from "./variant-selector"
import { BOOK_VARIANTS, BookVariant, variantPrice } from "@/lib/variants"
import { formatPrice } from "@/lib/utils"
import useCurrency from "@/hooks/use-currency"
import useCart from "@/hooks/use-cart"

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
        {/* close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors">
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col sm:flex-row">
          {/* cover */}
          <div className="relative w-full sm:w-52 shrink-0 bg-muted aspect-[3/4] sm:aspect-auto">
            {product.image ? (
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No cover</div>
            )}
          </div>

          {/* details */}
          <div className="flex flex-col gap-4 p-6 flex-1 min-w-0">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{product.category}</p>
              <h2 className="text-xl font-bold leading-snug">{product.name}</h2>
              {product.author && <p className="text-sm text-muted-foreground mt-1">by {product.author}</p>}
            </div>

            {/* tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.tags.slice(0, 5).map(({ tag }) => (
                  <span key={tag.name} className="text-[10px] font-medium rounded-full px-2 py-0.5 text-white"
                    style={{ backgroundColor: tag.color }}>{tag.name}</span>
                ))}
              </div>
            )}

            {/* price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{formatPrice(finalPrice, currency, rate)}</span>
              {selectedVariant.multiplier !== 1 && (
                <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price, currency, rate)}</span>
              )}
            </div>

            {/* variant selector */}
            <VariantSelector basePrice={product.price} selected={selectedVariant} onChange={setSelectedVariant} />

            {/* actions */}
            <div className="flex gap-2 mt-auto">
              <Button className="flex-1 gap-2" onClick={handleCart}>
                {inCart ? <><X className="h-4 w-4" /> Remove</> : <><ShoppingCart className="h-4 w-4" /> Add {selectedVariant.format}</>}
              </Button>
              <Button variant="outline" asChild onClick={onClose}>
                <Link href={`/product/${product.id}`} className="flex items-center gap-1.5">
                  <ExternalLink className="h-4 w-4" /> Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
