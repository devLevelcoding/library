"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { Category, Image, Product } from "@prisma/client"
import { formatter } from "@/lib/utils"

type SearchResult = Product & { category: Category; images: Image[] }

export default function SearchBar() {
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

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          placeholder="Search products..."
          aria-label="Search products"
          suppressHydrationWarning
          aria-autocomplete="list"
          aria-expanded={open && results.length > 0}
          aria-haspopup="listbox"
          role="combobox"
          className="w-full rounded-full border border-input bg-background pl-9 pr-8 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring transition"
        />
        {query && (
          <button onClick={handleClear} aria-label="Clear search" className="absolute right-3 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
        {loading && (
          <div className="absolute right-3 h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
        )}
      </div>

      {open && results.length > 0 && (
        <div role="listbox" aria-label="Search results" className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border bg-popover shadow-lg overflow-hidden">
          {results.map((product, idx) => {
            const imgUrl = product.images[0]?.url
            return (
              <button
                key={product.id}
                onMouseDown={() => handleSelect(product)}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  idx === activeIdx ? "bg-accent" : "hover:bg-accent/50"
                }`}
              >
                {/* thumbnail */}
                <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100 overflow-hidden">
                  {imgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgUrl} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gray-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{product.category.name}</p>
                </div>
                <span className="text-sm font-semibold text-nowrap">{formatter.format(Number(product.price))}</span>
              </button>
            )
          })}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border bg-popover shadow-lg px-4 py-3 text-sm text-muted-foreground">
          No products found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  )
}
