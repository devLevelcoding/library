"use client"

import { AccountModal } from "@/components/modals/account-modal";
import { Button } from "@/components/ui/button";
import useCart from "@/hooks/use-cart";
import { formatter } from "@/lib/utils";
import { User } from "@prisma/client";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import React, { MouseEventHandler, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface SummaryProps {
    currentUser: User | null
}

const Summary: React.FC<SummaryProps> = ({
    currentUser
}) => {
    const [open, setOpen] = useState(false)
    const cart = useCart()
    const searchParams = useSearchParams()
    const router = useRouter()

    const subtotal = cart.items.reduce((total, item) => {
        return total + Number(item.price)
    }, 0);

    useEffect(() => {
        if (searchParams?.get('success')) {
            toast.success('Payment completed!')
            cart.removeAll()
        }

        if (searchParams?.get('cancelled')) {
            toast.error('Something went wrong')
        }
    }, [searchParams, cart, cart.removeAll])

    const onRemoveAll: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.stopPropagation()
        cart.removeAll()
    }

    const onCheckout = () => {
        if (!currentUser?.id) {
            setOpen(true)
        } else {
            checkout()
        } 
    }

    const onAccountConfirm = () => {
        router.push('/sign-up')
    }

    const checkout = async () => {
        let response = await axios.post('/api/checkout', {
            productsId: cart.items.map(item => item.id)
        })

        window.location = response.data.url
    }

    return <>
        <div className="bg-gray-50 px-5 py-5">
            <div className="text-gray-700 flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-md">Subtotal</span>
                    <span className="text-bold">{ formatter.format(subtotal) }</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-md">Shipping</span>
                    <span className="text-bold">$0</span>
                </div>
            </div>
            <hr className="my-3"/>
            <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold">Total</span>
                    <span className="font-bold text-lg flex justify-end flex-col">
                        { formatter.format(subtotal) }
                    </span>
                </div>
                <div className="flex justify-end pr-4">
                    <span className="text-sm text-gray-600 font-light">including VAT</span>
                </div>
                <Button onClick={onRemoveAll} variant="outline" className="text-md text-muted-foreground hover:text-muted-foreground">
                    Empty Cart
                </Button>
                <Button onClick={onCheckout}    className="text-md">Checkout</Button>
            </div>
        </div>
        <AccountModal loading={false} isOpen={open} onConfirm={onAccountConfirm} onClose={() => setOpen(false)}/>
    </>
}
 
export default Summary;