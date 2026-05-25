"use client"

import { Product, Image, Category } from "@prisma/client"
import React from "react"
import NextImage from "next/image"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import useCart, { CartProduct } from "@/hooks/use-cart"
import useCurrency from "@/hooks/use-currency"

interface CartItemProps {
  data: CartProduct & { images: Image[]; category: Category }
}

const CartItem: React.FC<CartItemProps> = ({ data }) => {
  const cart = useCart()
  const { currency, rate } = useCurrency()

  return (
    <li className="flex py-6 border-b">
      <div className="h-40 w-40 overflow-hidden relative bg-gray-100 rounded-md shrink-0">
        {data?.images?.[0]?.url ? (
          <NextImage fill src={data.images[0].url} alt={data.name} className="aspect-square object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No image</div>
        )}
      </div>

      <div className="relative ml-6 flex flex-1 flex-col justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg text-black font-semibold leading-tight">{data.name}</h2>
          <p className="text-sm text-gray-500">{data.category.name}</p>
          {data.variantLabel && (
            <span className="inline-flex w-fit items-center text-xs font-medium bg-primary/10 text-primary rounded-full px-2.5 py-0.5">
              {data.variantLabel}
            </span>
          )}
        </div>
        <p className="text-base font-semibold mt-2">
          {formatPrice(Number(data.price), currency, rate)}
        </p>

        <div className="absolute top-0 right-0">
          <Button
            onClick={() => cart.removeItem(data.id, data.variantLabel)}
            size="icon" variant="outline"
            className="p-1 w-7 h-7 rounded-full border-gray-300 bg-white"
          >
            <X size={14} className="text-gray-500" />
          </Button>
        </div>
      </div>
    </li>
  )
}

export default CartItem
