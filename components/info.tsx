"use client"

import React, { useRef } from "react"
import { ShoppingCart, X } from "lucide-react"
import { Category, Product, Size } from "@prisma/client"
import { formatPrice } from "@/lib/utils"
import { Button } from "./ui/button"
import { VariantSelector } from "./variant-selector"
import { StickyCartBar } from "./sticky-cart-bar"
import { StockAlertForm } from "./stock-alert-form"
import { WishlistButton } from "./wishlist-button"
import { StockStatus } from "./stock-status"
import { InfoMeta } from "./info-meta"
import { useInfoCart } from "@/hooks/use-info-cart"

interface InfoProps {
  data: Product & { size: Size; images: []; category: Category }
}

const Info: React.FC<InfoProps> = ({ data }) => {
  const {
    mounted, selectedVariant, setSelectedVariant,
    currency, rate, basePrice, finalPrice, cartHasItem,
    onAddToCart, onRemoveFromCart,
  } = useInfoCart(data)
  const addToCartRef = useRef<HTMLButtonElement>(null)

  if (!mounted) return null

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

      <StockStatus productId={data.id} />

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

      <InfoMeta categoryName={data.category.name} sizeName={data?.size?.name} />
    </div>
  )
}

export default Info
