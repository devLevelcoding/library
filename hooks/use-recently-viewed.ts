import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface RecentProduct {
  id: string
  name: string
  price: number
  image: string
  category: string
  author?: string
}

interface RecentlyViewedStore {
  items: RecentProduct[]
  addItem: (product: RecentProduct) => void
  clear: () => void
}

const MAX_ITEMS = 6

const useRecentlyViewed = create(
  persist<RecentlyViewedStore>(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const filtered = get().items.filter(i => i.id !== product.id)
        set({ items: [product, ...filtered].slice(0, MAX_ITEMS) })
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: "recently-viewed",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useRecentlyViewed
