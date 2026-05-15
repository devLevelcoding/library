"use client"

import Link from "next/link"
import { formatter, truncate } from "@/lib/utils"
import { Category, Image, Product } from "@prisma/client"
import NextImage from "next/image"
import React, { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { ShoppingCart, X } from "lucide-react"
import useCart from "@/hooks/use-cart"

interface TagRef { id: string; name: string; color: string }

interface ProductCardProps {
  product: Product & { images: Image[]; category: Category; tags?: { tag: TagRef }[] }
  priority?: boolean
  onImageSettled?: () => void
}

const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false, onImageSettled }) => {
  const [mounted, setMounted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const cart = useCart()

  useEffect(() => { setMounted(true) }, [])

  const imageUrl = product?.images?.[0]?.url
  const validImage = imageUrl?.startsWith("http://") || imageUrl?.startsWith("https://")

  useEffect(() => {
    if (mounted && !validImage) onImageSettled?.()
  }, [mounted, validImage, onImageSettled])

  const cartHasProduct = mounted ? cart.items.find(item => item.id === product.id) : null

  const onAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    cart.addItem(product)
  }

  const onRemoveFromCart = (e: React.MouseEvent) => {
    e.preventDefault()
    cart.removeItem(product.id)
  }

  const handleSettled = () => {
    setImageLoaded(true)
    onImageSettled?.()
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className="bg-white group border p-3 rounded-md flex flex-col gap-y-3 hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-gray-100 relative flex items-center justify-center overflow-hidden">
        {validImage && !imageLoaded && (
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:200%_100%]" />
        )}
        {validImage ? (
          <NextImage
            fill
            src={imageUrl}
            alt={product.name}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            quality={75}
            className={`aspect-square object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            priority={priority}
            onLoad={handleSettled}
            onError={handleSettled}
          />
        ) : (
          <span className="text-xs text-gray-400">No image</span>
        )}
        {mounted && (
          <div className="opacity-0 group-hover:opacity-100 transition absolute w-full px-6 bottom-5">
            <div className="flex items-center justify-center gap-x-6">
              {cartHasProduct ? (
                <Button onClick={onRemoveFromCart} variant="outline" className="border-neutral-300" aria-label={`Remove ${product.name} from cart`}>
                  <X size={25} className="text-neutral-800" aria-hidden="true" />
                </Button>
              ) : (
                <Button onClick={onAddToCart} variant="outline" className="border-neutral-300" aria-label={`Add ${product.name} to cart`}>
                  <ShoppingCart size={25} className="text-neutral-800" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-neutral-800">{truncate(product.name, 30)}</h2>
        <p className="text-sm text-muted-foreground">{product.category.name}</p>
      </div>
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {product.tags.slice(0, 3).map(({ tag }) => (
            <span
              key={tag.id}
              className="text-[10px] font-medium rounded-full px-2 py-0.5 text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
      <div>
        <p className="font-medium">{formatter.format(Number(product.price))}</p>
      </div>

      {mounted && (
        <div className="flex sm:hidden items-center justify-end">
          {cartHasProduct ? (
            <Button onClick={onRemoveFromCart} className="flex items-center gap-x-2" aria-label={`Remove ${product.name} from cart`}>
              Remove from cart <X aria-hidden="true" />
            </Button>
          ) : (
            <Button onClick={onAddToCart} className="flex items-center gap-x-2" aria-label={`Add ${product.name} to cart`}>
              Add To Cart <ShoppingCart aria-hidden="true" />
            </Button>
          )}
        </div>
      )}
    </Link>
  )
}

export default ProductCard
