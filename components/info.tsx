"use client"

import React, { MouseEventHandler, useEffect, useState } from "react";
import { ShoppingCart, X } from "lucide-react";
import { Category, Product, Size } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { Button } from "./ui/button";
import useCart from "@/hooks/use-cart";
import useCurrency from "@/hooks/use-currency";

interface InfoProps {
    data: Product & {
        size: Size,
        images: [],
        category: Category,
    }
}

const Info: React.FC<InfoProps> = ({
    data,
}) => {
    const [mounted, setMounted] = useState(false)
    const cart = useCart()
    const { currency, rate } = useCurrency()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const cartHasProduct = cart.items.find(item => item.id === data.id);

    const onAddToCart: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.stopPropagation()

        cart.addItem(data)
    }

    const onRemoveFromCart: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.stopPropagation()

        cart.removeItem(data.id)
    }


    return <div>
        <h1 className="text-3xl font-bold text-gray-900">{data.name}</h1>
        <div className="mt-3 flex items-end justify-between">
            <p className="text-2xl text-gray-900">
                { formatPrice(Number(data.price), currency, rate) }
            </p>
        </div>
        <hr className="my-4"/>
        <div className="flex flex-col gap-y-6">
            <div className="flex items-center gap-x-4">
                <h3 className="font-semibold text-black">Size:</h3>
                <div>
                    {data?.size?.name}
                </div>
            </div>
        </div>
        <div className="mt-10 flex items-center gap-x-3">
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
 
export default Info;