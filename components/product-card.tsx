"use client"

import Link from "next/link"
import { formatPrice, truncate } from "@/lib/utils"
import { Category, Image, Product } from "@prisma/client"
import React from "react"
import { QuickViewModal } from "./quick-view-modal"
import { ProductCardCover } from "./product-card/product-card-cover"
import { MobileCartButton } from "./product-card/mobile-cart-button"
import { useProductCard } from "@/hooks/use-product-card"

interface TagRef { id: string; name: string; color: string }

interface ProductCardProps {
  product: Product & { images: Image[]; category: Category; tags?: { tag: TagRef }[] }
  priority?: boolean
  onImageSettled?: () => void
}

const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false, onImageSettled }) => {
  const {
    mounted, imageLoaded, showQuickView, setShowQuickView,
    currency, rate,
    inCompare, stock, isOutOfStock,
    imageUrl, validImage,
    cartHasProduct,
    onAddToCart, onRemoveFromCart, handleSettled, toggleCompare,
    quickViewProduct,
  } = useProductCard(product, onImageSettled)

  return (
    <>
      <Link
        href={`/product/${product.id}`}
        className="bg-white group border p-3 rounded-md flex flex-col gap-y-3 hover:shadow-md transition-shadow"
      >
        <ProductCardCover
          imageUrl={imageUrl}
          validImage={validImage}
          imageLoaded={imageLoaded}
          productName={product.name}
          priority={priority}
          stock={stock}
          mounted={mounted}
          onImageLoad={handleSettled}
          hoverActionsProps={{
            onQuickView: () => setShowQuickView(true),
            cartHasProduct: !!cartHasProduct,
            isOutOfStock,
            onAddToCart,
            onRemoveFromCart,
            inCompare,
            onToggleCompare: toggleCompare,
            wishlistProduct: { id: product.id, name: product.name, price: Number(product.price), image: imageUrl ?? "", category: product.category.name, author: (product as any).author },
          }}
        />

        <div>
          <h2 className="text-lg font-semibold text-neutral-800">{truncate(product.name, 30)}</h2>
          <p className="text-sm text-muted-foreground">{product.category.name}</p>
        </div>
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map(({ tag }) => (
              <span key={tag.id} className="text-[10px] font-medium rounded-full px-2 py-0.5 text-white" style={{ backgroundColor: tag.color }}>
                {tag.name}
              </span>
            ))}
          </div>
        )}
        <div>
          <p className="font-medium">{formatPrice(Number(product.price), currency, rate)}</p>
        </div>

        {mounted && (
          <MobileCartButton
            productName={product.name}
            cartHasProduct={!!cartHasProduct}
            isOutOfStock={isOutOfStock}
            onAddToCart={onAddToCart}
            onRemoveFromCart={onRemoveFromCart}
          />
        )}
      </Link>

      {showQuickView && <QuickViewModal product={quickViewProduct} onClose={() => setShowQuickView(false)} />}
    </>
  )
}

export default ProductCard
