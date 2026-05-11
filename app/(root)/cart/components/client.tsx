"use client"

import useCart from "@/hooks/use-cart"
import React, { useEffect, useState } from "react"
import CartItem from "./cart-item"
import Summary from "./summary"
import { User } from "@prisma/client"

interface CartClientProps {
    currentUser: User | null
}

const CartClient: React.FC<CartClientProps> = ({
    currentUser,
}) => {
    const [mounted, setMounted] = useState(false)
    const items = useCart((state) => state.items);

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return <div className="bg-white">
            <h1 className="text-3xl font-bold text-black">Shopping Cart</h1>
            <div className="mt-4 lg:grid lg:grid-cols-12 lg:items-start gap-x-12 space-y-12 lg:space-y-0">
                <div className="lg:col-span-8">
                    {items.length === 0 && (
                        <p className="text-neutral-500">
                            No items added to cart
                        </p>
                    )}
                    <ul>
                        {items.map((item) => (
                            <CartItem 
                                key={item.id}
                                /* @ts-ignore */
                                data={item}
                            />                    
                        ))}
                    </ul>
                </div>
                {items.length > 0 && <div className="lg:col-span-4">
                    <Summary 
                        currentUser={currentUser}
                    />
                </div>}
            </div>
        </div>
}
 
export default CartClient