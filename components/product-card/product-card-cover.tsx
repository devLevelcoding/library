import NextImage from "next/image"
import { StockBadge } from "../stock-badge"
import { HoverActions } from "./hover-actions"

interface ProductCardCoverProps {
  imageUrl?: string
  validImage: boolean | undefined
  imageLoaded: boolean
  productName: string
  priority: boolean
  stock: number
  mounted: boolean
  onImageLoad: () => void
  hoverActionsProps: React.ComponentProps<typeof HoverActions>
}

export function ProductCardCover({
  imageUrl, validImage, imageLoaded, productName, priority, stock, mounted, onImageLoad, hoverActionsProps,
}: ProductCardCoverProps) {
  return (
    <div className="aspect-square bg-gray-100 relative flex items-center justify-center overflow-hidden">
      <div className="absolute top-2 left-2 z-10">
        <StockBadge stock={stock} />
      </div>
      {validImage && !imageLoaded && (
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:200%_100%]" />
      )}
      {validImage ? (
        <NextImage
          fill
          src={imageUrl!}
          alt={productName}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          quality={75}
          className={`aspect-square object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          priority={priority}
          onLoad={onImageLoad}
          onError={onImageLoad}
        />
      ) : (
        <span className="text-xs text-gray-400">No image</span>
      )}

      {mounted && <HoverActions {...hoverActionsProps} />}
    </div>
  )
}
