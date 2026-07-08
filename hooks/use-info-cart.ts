import { MouseEventHandler, useEffect, useState } from "react"
import { Category, Product, Size } from "@prisma/client"
import useCart from "@/hooks/use-cart"
import useCurrency from "@/hooks/use-currency"
import { BOOK_VARIANTS, BookVariant, variantPrice } from "@/lib/variants"

type InfoProduct = Product & { size: Size; images: []; category: Category }

export function useInfoCart(data: InfoProduct) {
  const [mounted, setMounted] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<BookVariant>(BOOK_VARIANTS[0])
  const cart = useCart()
  const { currency, rate } = useCurrency()

  useEffect(() => { setMounted(true) }, [])

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

  return {
    mounted, selectedVariant, setSelectedVariant,
    currency, rate, basePrice, finalPrice, cartHasItem,
    onAddToCart, onRemoveFromCart,
  }
}
