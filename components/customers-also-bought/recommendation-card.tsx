import Link from "next/link"
import NextImage from "next/image"
import { ShoppingCart } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { RecProduct } from "@/hooks/use-customers-also-bought"

interface RecommendationCardProps {
  product: RecProduct
  inCart: boolean
  currency: string
  rate: number
  onToggleCart: () => void
}

export function RecommendationCard({ product, inCart, currency, rate, onToggleCart }: RecommendationCardProps) {
  const price = Number(product.price)
  const imageUrl = product.images?.[0]?.url ?? ""

  return (
    <div className="flex-none w-[160px] sm:w-[180px] snap-start group flex flex-col">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-gray-100 mb-2">
          {imageUrl ? (
            <NextImage
              src={imageUrl}
              alt={product.name}
              fill
              sizes="180px"
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
          {formatPrice(price, currency, rate)}
        </p>
      </Link>

      <button
        onClick={onToggleCart}
        className={`mt-2 w-full flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
          inCart
            ? "border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
            : "border-primary bg-primary text-primary-foreground hover:opacity-90"
        }`}
      >
        <ShoppingCart className="h-3 w-3" />
        {inCart ? "In cart" : "Add to cart"}
      </button>
    </div>
  )
}
