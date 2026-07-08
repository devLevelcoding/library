import { useEffect, useRef, useState } from "react"

export interface RecProduct {
  id: string
  name: string
  price: number | string | { toString(): string }
  images: { url: string }[]
  category: { name: string }
  [key: string]: any
}

export function useCustomersAlsoBought(productId: string) {
  const [items, setItems] = useState<RecProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    fetch(`/api/recommendations?productId=${productId}&limit=8`)
      .then(r => r.json())
      .then(data => setItems(data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [productId])

  const scroll = (dir: "left" | "right") => {
    if (!trackRef.current) return
    const w = trackRef.current.clientWidth
    trackRef.current.scrollBy({ left: dir === "left" ? -(w / 2) : w / 2, behavior: "smooth" })
  }

  return { items, loading, mounted, trackRef, scroll }
}
