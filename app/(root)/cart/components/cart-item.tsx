"use client"

import { Product, Image, Category } from "@prisma/client";
import React from "react";
import NextImage from "next/image"
import { formatter } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import useCart from "@/hooks/use-cart";

interface CartItemProps {
    data: Product & {
        images: Image[],
        category: Category
    }
}

const CartItem: React.FC<CartItemProps> = ({
    data
}) => {
    const cart = useCart()
    const onRemoveFromCart = () => {
        cart.removeItem(data.id)
    }

    return <li className="flex py-6 border-b">
        <div className="h-40 w-40 overflow-hidden relative bg-gray-100">
            <NextImage 
                fill
                src={data?.images?.[0]?.url}
                alt='Image'
                className="aspect-square object-cover"
            />
        </div>
        <div className="relative m-4 flex flex-1 flex-col justify-between sm:ml-6">
            <div>
                <h2 className="text-lg text-black font-semibold">{data.name}</h2>
                <p className="text-gray-500">{data.category.name}</p>
            </div>
            <div>
                <p>
                    { formatter.format(Number(data.price)) }
                </p>
            </div>
            <div className="absolute z-10 top-0 right-0">
                <Button onClick={onRemoveFromCart} size="icon" variant="outline" className="p-1 w-auto h-auto rounded-full border-gray-300 bg-white">
                    <X size={20} className="text-gray-500"/>
                </Button>
            </div>
        </div>
    </li>;
}
 
export default CartItem;