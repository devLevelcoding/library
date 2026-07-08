import Link from "next/link"
import NextImage from "next/image"
import { ShoppingCart, Trash2 } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface WishlistItem {
  id: string
  name: string
  price: number
  image?: string
  category: string
  author?: string
}

interface WishlistItemCardProps {
  product: WishlistItem
  inCart: boolean
  currency: string
  rate: number
  onToggleCart: () => void
  onRemove: () => void
}

export function WishlistItemCard({ product, inCart, currency, rate, onToggleCart, onRemove }: WishlistItemCardProps) {
  return (
    <div className="group flex flex-col rounded-xl border bg-white overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/product/${product.id}`} className="relative aspect-[2/3] bg-gray-100 overflow-hidden">
        {product.image ? (
          <NextImage
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200">📖</div>
        )}
      </Link>

      <div className="flex flex-col gap-2 p-3 flex-1">
        <div className="flex-1">
          <Link href={`/product/${product.id}`}>
            <p className="font-semibold text-sm text-gray-900 line-clamp-2 hover:underline leading-snug">
              {product.name}
            </p>
          </Link>
          {product.author && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{product.author}</p>
          )}
          <p className="text-xs text-muted-foreground">{product.category}</p>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {formatPrice(product.price, currency, rate)}
          </p>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onToggleCart}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium border transition-colors ${
              inCart
                ? "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
                : "border-primary bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            <ShoppingCart className="h-3 w-3" />
            {inCart ? "In cart" : "Add to cart"}
          </button>
          <button
            onClick={onRemove}
            aria-label="Remove from wishlist"
            className="flex items-center justify-center rounded-md border border-gray-200 px-2 py-1.5 text-gray-400 hover:text-rose-500 hover:border-rose-200 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
