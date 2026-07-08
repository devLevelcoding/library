"use client"

import { Search, X } from "lucide-react"
import { useSearchBar } from "@/hooks/use-search-bar"
import { SearchResultsList } from "./search-bar/search-results-list"

export default function SearchBar() {
  const {
    query, results, open, setOpen, loading, activeIdx, setActiveIdx,
    inputRef, containerRef,
    handleChange, handleSelect, handleClear, handleKeyDown,
  } = useSearchBar()

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
          aria-controls="search-listbox"
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
        <SearchResultsList results={results} activeIdx={activeIdx} onHover={setActiveIdx} onSelect={handleSelect} />
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border bg-popover shadow-lg px-4 py-3 text-sm text-muted-foreground">
          No products found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  )
}
