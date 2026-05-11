"use client"

import { formatter, truncate } from "@/lib/utils";
import { Category, Image, Product } from "@prisma/client";
import NextImage from "next/image";
import React, { MouseEventHandler, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Expand, Eye, ShoppingCart, X } from "lucide-react";
import useCart from "@/hooks/use-cart";
import { useRouter } from "next/navigation";

interface ProductCardProps {
    product: Product & {
        images: Image[],
        category: Category,
    }
    priority?: boolean
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    priority = false,
}) => {
    const [mounted, setMounted] = useState(false)
    const cart = useCart()
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null


    const onAddToCart: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.stopPropagation()

        cart.addItem(product)
    }

    const onRemoveFromCart: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.stopPropagation()

        cart.removeItem(product.id)
    }

    const onViewProduct: MouseEventHandler<HTMLDivElement> = (event) => {
        event.stopPropagation()
        router.push(`/product/${product.id}`)
    }

    const cartHasProduct = cart.items.find(item => item.id === product.id);

    return <div onClick={onViewProduct} className="bg-white group border p-3 rounded-md flex flex-col gap-y-3 cursor-pointer">
        <div className="aspect-square bg-gray-100 relative">
            <NextImage
                fill
                src={product?.images?.[0]?.url}
                alt={product.name}
                className="aspect-square object-cover"
                priority={priority}
            />
            <div className="opacity-0 group-hover:opacity-100 transition absolute w-full px-6 bottom-5">
                <div className="flex items-center justify-center gap-x-6">
                    <Button variant='outline' className="border-gray-300">
                        <Eye size={25} className="text-gray-600"/>
                    </Button>
                    {cartHasProduct?.id && <Button onClick={onRemoveFromCart} variant='outline' className="border-neutral-300">
                        <X size={25} className="text-neutral-800"/>
                    </Button>}
                    {!cartHasProduct?.id && <Button onClick={onAddToCart} variant='outline' className="border-neutral-300">
                        <ShoppingCart size={25} className="text-neutral-800"/>
                    </Button>}
                </div>
            </div>
        </div>
        <div>
            <h2 className="text-lg font-semibold text-neutral-800">
                {truncate(product.name, 30)}
            </h2>
            <p>{product.category.name}</p>
        </div>
        <div>
            <p>{formatter.format(Number(product.price))}</p>
        </div>
        <div className="flex sm:hidden items-center justify-end">
            {!cartHasProduct && <Button onClick={onAddToCart}  className="flex items-center gap-x-2">
                Add To Cart
                <ShoppingCart />
            </Button>}
            {cartHasProduct && <Button onClick={onRemoveFromCart}  className="flex items-center gap-x-2">
                Remove from cart
                <X />
            </Button>}
        </div>
    </div>;
}
 
export default ProductCard;