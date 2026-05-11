import { persist, createJSONStorage } from "zustand/middleware"

import { Product } from "@prisma/client";
import { create } from "zustand";
import toast from "react-hot-toast";

interface CartStore {
    items: Product[]
    addItem: (data: Product) => void
    removeItem: (id: string) => void
    removeAll: () => void
}

const useCart = create(
    persist<CartStore>((set, get) => ({
        items: [],
        addItem: (data: Product) => {
            const currentItems = get().items
            const existingItem = currentItems.find(item => item.id === data.id)

            if (existingItem) return toast('Product already in cart.')

            set({items: [...get().items, data]})
            toast.success('The product was added to your cart')
        },
        removeItem: (id: string) => {
            set({items: [...get().items.filter(item => item.id !== id)]})
            toast.success('The product was removed from your cart.')
        },
        removeAll: () => {
            set({items: []})
            toast.success('Your shopping cart was emptied.')
        }
    }), {
        name: 'cart-storage',
        storage: createJSONStorage(() => localStorage)
    })
)

export default useCart