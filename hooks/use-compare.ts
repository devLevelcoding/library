import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import toast from "react-hot-toast"

export interface CompareProduct {
  id: string
  name: string
  price: number
  category: string
  author?: string | null
  image?: string
  tags?: { tag: { name: string; color: string } }[]
}

interface CompareStore {
  items: CompareProduct[]
  addItem: (product: CompareProduct) => void
  removeItem: (id: string) => void
  clearAll: () => void
}

const useCompare = create(
  persist<CompareStore>(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const current = get().items
        if (current.find(p => p.id === product.id)) {
          toast("Already in comparison.")
          return
        }
        if (current.length >= 3) {
          toast.error("You can compare up to 3 books at a time.")
          return
        }
        set({ items: [...current, product] })
        toast.success(`"${product.name.slice(0, 20)}..." added to compare`)
      },
      removeItem: (id) => set({ items: get().items.filter(p => p.id !== id) }),
      clearAll: () => set({ items: [] }),
    }),
    { name: "compare-storage", storage: createJSONStorage(() => localStorage) }
  )
)

export default useCompare
