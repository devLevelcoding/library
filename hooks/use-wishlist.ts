import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import toast from "react-hot-toast"

export interface WishlistProduct {
  id: string
  name: string
  price: number
  image: string
  category: string
  author?: string
}

interface WishlistStore {
  items: WishlistProduct[]
  addItem: (product: WishlistProduct) => void
  removeItem: (id: string) => void
  toggle: (product: WishlistProduct) => void
  hasItem: (id: string) => boolean
}

const useWishlist = create(
  persist<WishlistStore>(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        if (get().items.find(i => i.id === product.id)) return
        set({ items: [...get().items, product] })
        toast.success("Saved to wishlist")
      },
      removeItem: (id) => {
        set({ items: get().items.filter(i => i.id !== id) })
        toast.success("Removed from wishlist")
      },
      toggle: (product) => {
        if (get().items.find(i => i.id === product.id)) {
          get().removeItem(product.id)
        } else {
          get().addItem(product)
        }
      },
      hasItem: (id) => !!get().items.find(i => i.id === id),
    }),
    {
      name: "wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useWishlist
