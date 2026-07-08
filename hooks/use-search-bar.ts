import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Category, Image, Product } from "@prisma/client"

export type SearchResult = Product & { category: Category; images: Image[] }

export function useSearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const search = useCallback((q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(data => { setResults(data); setOpen(true); setActiveIdx(-1) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const handleSelect = (product: SearchResult) => {
    setOpen(false)
    setQuery("")
    router.push(`/product/${product.id}`)
  }

  const handleClear = () => {
    setQuery("")
    setResults([])
    setOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)) }
    if (e.key === "Enter" && activeIdx >= 0) handleSelect(results[activeIdx])
    if (e.key === "Escape") { setOpen(false); setActiveIdx(-1) }
  }

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return {
    query, results, open, setOpen, loading, activeIdx, setActiveIdx,
    inputRef, containerRef,
    handleChange, handleSelect, handleClear, handleKeyDown,
  }
}
