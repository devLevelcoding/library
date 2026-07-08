"use client"

import { Button } from "@/components/ui/button"
import { useFilterPanel } from "@/hooks/use-filter-panel"
import { SearchInput } from "./filter-panel/search-input"
import { ActiveFilterRow } from "./filter-panel/active-filter-row"
import { TagGroups } from "./filter-panel/tag-groups"
import { PriceRange } from "./filter-panel/price-range"
import { SubcategoryList } from "./filter-panel/subcategory-list"

export interface FilterState {
  query: string
  minPrice: string
  maxPrice: string
  categoryIds: string[]
  tagIds: string[]
}

interface Subcategory { id: string; name: string }

interface Tag { id: string; name: string; slug: string; color: string; group: string }

interface FilterPanelProps {
  absoluteMin: number
  absoluteMax: number
  subcategories?: Subcategory[]
  defaultCategoryIds?: string[]
  availableTags?: Tag[]
  onApply: (filters: FilterState) => void
}

export function FilterPanel({
  absoluteMin,
  absoluteMax,
  subcategories = [],
  defaultCategoryIds = [],
  availableTags = [],
  onApply,
}: FilterPanelProps) {
  const {
    open, setOpen,
    query, minPrice, setMinPrice, maxPrice, setMaxPrice,
    selectedIds, setSelectedIds,
    selectedTagIds,
    hasActiveFilters,
    handleToggleId,
    handleToggleTag,
    handleQueryChange,
    handleApply,
    handleReset,
  } = useFilterPanel({ defaultCategoryIds, onApply })

  const activeTags = availableTags.filter(t => selectedTagIds.includes(t.id))

  return (
    <div className="mb-4 space-y-3">
      <SearchInput query={query} onQueryChange={handleQueryChange} />

      <ActiveFilterRow
        open={open}
        onToggleOpen={() => setOpen(o => !o)}
        hasActiveFilters={hasActiveFilters}
        onReset={handleReset}
        activeTags={activeTags}
        onToggleTag={handleToggleTag}
        minPrice={minPrice}
        maxPrice={maxPrice}
      />

      {open && (
        <div className="border rounded-xl bg-background shadow-sm overflow-hidden">
          <TagGroups availableTags={availableTags} selectedTagIds={selectedTagIds} onToggleTag={handleToggleTag} />

          <div className="p-4 flex flex-wrap gap-8">
            <PriceRange
              absoluteMin={absoluteMin}
              absoluteMax={absoluteMax}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
            />
            <SubcategoryList
              subcategories={subcategories}
              selectedIds={selectedIds}
              defaultCategoryIds={defaultCategoryIds}
              onToggleId={handleToggleId}
              onSelectAll={() => setSelectedIds(defaultCategoryIds)}
            />
          </div>

          <div className="px-4 pb-4 flex items-center gap-2">
            <Button size="sm" onClick={handleApply}>Apply filters</Button>
            <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  )
}
