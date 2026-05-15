"use client"

import { useState, useRef } from "react"
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatter } from "@/lib/utils"

export interface FilterState {
  query: string
  minPrice: string
  maxPrice: string
  categoryIds: string[]   // empty = all
}

interface Subcategory {
  id: string
  name: string
}

interface FilterPanelProps {
  absoluteMin: number
  absoluteMax: number
  subcategories?: Subcategory[]
  defaultCategoryIds?: string[]   // initial checked state (all by default)
  onApply: (filters: FilterState) => void
}

export function FilterPanel({
  absoluteMin,
  absoluteMax,
  subcategories = [],
  defaultCategoryIds = [],
  onApply,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultCategoryIds)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasActiveFilters =
    query !== "" || minPrice !== "" || maxPrice !== "" || selectedIds.length !== defaultCategoryIds.length

  const handleToggleId = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => setSelectedIds(defaultCategoryIds)

  const handleQueryChange = (val: string) => {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onApply({ query: val, minPrice, maxPrice, categoryIds: selectedIds })
    }, 350)
  }

  const handleApply = () => {
    onApply({ query, minPrice, maxPrice, categoryIds: selectedIds })
    setOpen(false)
  }

  const handleReset = () => {
    setQuery("")
    setMinPrice("")
    setMaxPrice("")
    setSelectedIds(defaultCategoryIds)
    onApply({ query: "", minPrice: "", maxPrice: "", categoryIds: defaultCategoryIds })
  }

  return (
    <div className="mb-4 space-y-3">
      {/* inline category search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
        <label htmlFor="category-search" className="sr-only">Search within this category</label>
        <input
          id="category-search"
          type="text"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          placeholder="Search by title or author..."
          className="w-full rounded-full border border-input bg-background pl-9 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition"
        />
        {query && (
          <button
            onClick={() => handleQueryChange("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* toggle bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 text-sm font-medium border rounded-lg px-3 py-2 hover:bg-accent transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
          )}
          {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" /> Clear filters
          </button>
        )}

        {/* active filter chips */}
        <div className="flex flex-wrap gap-1.5">
          {minPrice && (
            <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
              Min {formatter.format(parseFloat(minPrice))}
            </span>
          )}
          {maxPrice && (
            <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
              Max {formatter.format(parseFloat(maxPrice))}
            </span>
          )}
          {subcategories.length > 0 && selectedIds.length < defaultCategoryIds.length && (
            <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
              {selectedIds.length} / {subcategories.length} categories
            </span>
          )}
        </div>
      </div>

      {/* panel */}
      {open && (
        <div className="mt-2 border rounded-xl p-4 bg-background shadow-sm">
          <div className="flex flex-wrap gap-8">

            {/* price range */}
            <div className="min-w-[220px]">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Price range
              </p>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground" aria-hidden="true">$</span>
                  <label htmlFor="filter-min-price" className="sr-only">Minimum price</label>
                  <input
                    id="filter-min-price"
                    type="number"
                    min={0}
                    placeholder={String(Math.floor(absoluteMin))}
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className="w-full border rounded-md pl-6 pr-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <span className="text-muted-foreground text-sm" aria-hidden="true">—</span>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground" aria-hidden="true">$</span>
                  <label htmlFor="filter-max-price" className="sr-only">Maximum price</label>
                  <input
                    id="filter-max-price"
                    type="number"
                    min={0}
                    placeholder={String(Math.ceil(absoluteMax))}
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="w-full border rounded-md pl-6 pr-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Range: {formatter.format(absoluteMin)} – {formatter.format(absoluteMax)}
              </p>
            </div>

            {/* subcategory filter */}
            {subcategories.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Categories
                  </p>
                  {selectedIds.length < defaultCategoryIds.length && (
                    <button
                      onClick={handleSelectAll}
                      className="text-xs text-primary hover:underline"
                    >
                      Select all
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 max-h-40 overflow-y-auto">
                  {subcategories.map(sub => (
                    <label key={sub.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(sub.id)}
                        onChange={() => handleToggleId(sub.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm group-hover:text-foreground text-muted-foreground transition-colors truncate">
                        {sub.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button size="sm" onClick={handleApply}>Apply filters</Button>
            <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  )
}
