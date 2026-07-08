import { useEffect, useState } from "react"
import { Category, Image, Product } from "@prisma/client"
import useCart from "@/hooks/use-cart"
import useCurrency from "@/hooks/use-currency"
import useCompare from "@/hooks/use-compare"
import { deriveStock } from "@/lib/stock"
import { QuickViewProduct } from "@/components/quick-view-modal"

interface TagRef { id: string; name: string; color: string }
type CardProduct = Product & { images: Image[]; category: Category; tags?: { tag: TagRef }[] }

export function useProductCard(product: CardProduct, onImageSettled?: () => void) {
  const [mounted, setMounted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)
  const cart = useCart()
  const { currency, rate } = useCurrency()
  const compare = useCompare()
  const inCompare = mounted && !!compare.items.find(p => p.id === product.id)
  const stock = deriveStock(product.id)
  const isOutOfStock = stock === 0

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

  const toggleCompare = () => {
    if (inCompare) {
      compare.removeItem(product.id)
    } else {
      compare.addItem({
        id: product.id, name: product.name, price: Number(product.price),
        category: product.category.name, author: (product as any).author,
        image: imageUrl, tags: (product as any).tags,
      })
    }
  }

  const quickViewProduct: QuickViewProduct = {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    author: (product as any).author,
    category: product.category.name,
    image: imageUrl,
    tags: (product as any).tags,
  }

  return {
    mounted, imageLoaded, showQuickView, setShowQuickView,
    currency, rate,
    inCompare, stock, isOutOfStock,
    imageUrl, validImage,
    cartHasProduct,
    onAddToCart, onRemoveFromCart, handleSettled, toggleCompare,
    quickViewProduct,
  }
}
