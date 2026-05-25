import { persist, createJSONStorage } from "zustand/middleware"
import { Product } from "@prisma/client"
import { create } from "zustand"
import toast from "react-hot-toast"

export type CartProduct = Product & { variantLabel?: string }

interface CartStore {
  items: CartProduct[]
  addItem: (data: Product, variantLabel?: string, overridePrice?: number) => void
  removeItem: (id: string, variantLabel?: string) => void
  removeAll: () => void
}

const useCart = create(
  persist<CartStore>((set, get) => ({
    items: [],
    addItem: (data, variantLabel, overridePrice) => {
      const key = variantLabel ? `${data.id}__${variantLabel}` : data.id
      const existing = get().items.find(i => itemKey(i) === key)
      if (existing) { toast("Already in cart."); return }

      const item: CartProduct = {
        ...data,
        // store the variant-adjusted price directly on the item
        price: overridePrice !== undefined ? (overridePrice as any) : data.price,
        variantLabel,
      }
      set({ items: [...get().items, item] })
      toast.success(variantLabel ? `${variantLabel} added to cart` : "Added to cart")
    },
    removeItem: (id, variantLabel) => {
      const key = variantLabel ? `${id}__${variantLabel}` : id
      set({ items: get().items.filter(i => itemKey(i) !== key) })
      toast.success("Removed from cart")
    },
    removeAll: () => { set({ items: [] }); toast.success("Cart emptied") },
  }), {
    name: "cart-storage",
    storage: createJSONStorage(() => localStorage),
  })
)

function itemKey(item: CartProduct) {
  return item.variantLabel ? `${item.id}__${item.variantLabel}` : item.id
}

export default useCart
