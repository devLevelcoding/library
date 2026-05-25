"use client"

import React, { MouseEventHandler, useEffect, useRef, useState } from "react"
import { ShoppingCart, X } from "lucide-react"
import { Category, Product, Size } from "@prisma/client"
import { formatPrice } from "@/lib/utils"
import { Button } from "./ui/button"
import useCart from "@/hooks/use-cart"
import useCurrency from "@/hooks/use-currency"
import { VariantSelector } from "./variant-selector"
import { BOOK_VARIANTS, BookVariant, variantPrice } from "@/lib/variants"
import { StickyCartBar } from "./sticky-cart-bar"
import { StockAlertForm } from "./stock-alert-form"
import { WishlistButton } from "./wishlist-button"

interface InfoProps {
  data: Product & { size: Size; images: []; category: Category }
}

const Info: React.FC<InfoProps> = ({ data }) => {
  const [mounted, setMounted] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<BookVariant>(BOOK_VARIANTS[0])
  const cart = useCart()
  const { currency, rate } = useCurrency()
  const addToCartRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const basePrice = Number(data.price)
  const finalPrice = variantPrice(basePrice, selectedVariant.multiplier)
  const cartHasItem = cart.items.find(
    i => i.id === data.id && i.variantLabel === selectedVariant.format
  )

  const onAddToCart: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    cart.addItem(data, selectedVariant.format, finalPrice)
  }

  const onRemoveFromCart: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    cart.removeItem(data.id, selectedVariant.format)
  }

  return (
    <div className="flex flex-col gap-y-5">
      <h1 className="text-3xl font-bold text-gray-900">{data.name}</h1>
      {(data as any).author && (
        <p className="text-base text-muted-foreground">by {(data as any).author}</p>
      )}

      <div className="flex items-baseline gap-3">
        <p className="text-3xl font-bold text-gray-900">{formatPrice(finalPrice, currency, rate)}</p>
        {selectedVariant.multiplier !== 1 && (
          <p className="text-lg text-muted-foreground line-through">{formatPrice(basePrice, currency, rate)}</p>
        )}
      </div>

      <hr />

      <VariantSelector
        basePrice={basePrice}
        selected={selectedVariant}
        onChange={setSelectedVariant}
      />

      <div className="flex items-center gap-x-3 mt-2 flex-wrap">
        {cartHasItem ? (
          <Button ref={addToCartRef} onClick={onRemoveFromCart} variant="outline" className="flex items-center gap-x-2">
            Remove from cart <X />
          </Button>
        ) : (
          <Button ref={addToCartRef} onClick={onAddToCart} className="flex items-center gap-x-2">
            Add {selectedVariant.format} to Cart <ShoppingCart />
          </Button>
        )}
        <WishlistButton
          product={{
            id: data.id,
            name: data.name,
            price: finalPrice,
            image: (data as any).images?.[0]?.url ?? "",
            category: data.category.name,
            author: (data as any).author ?? undefined,
          }}
          variant="button"
        />
      </div>

      <StockAlertForm productId={data.id} productName={data.name} />

      <StickyCartBar
        product={{ id: data.id, name: data.name, price: basePrice, image: (data as any).images?.[0]?.url }}
        selectedVariant={selectedVariant}
        triggerRef={addToCartRef}
      />

      <div className="flex flex-col gap-y-2 text-sm text-muted-foreground">
        <div className="flex gap-2">
          <span className="font-medium text-gray-700">Category:</span>
          <span>{data.category.name}</span>
        </div>
        {data?.size?.name && (
          <div className="flex gap-2">
            <span className="font-medium text-gray-700">Size:</span>
            <span>{data.size.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Info
