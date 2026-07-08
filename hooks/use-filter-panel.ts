import { useRef, useState } from "react"
import { FilterState } from "@/components/filter-panel"

interface UseFilterPanelArgs {
  defaultCategoryIds: string[]
  onApply: (filters: FilterState) => void
}

export function useFilterPanel({ defaultCategoryIds, onApply }: UseFilterPanelArgs) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultCategoryIds)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasActiveFilters =
    query !== "" || minPrice !== "" || maxPrice !== "" ||
    selectedIds.length !== defaultCategoryIds.length ||
    selectedTagIds.length > 0

  const handleToggleId = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleToggleTag = (id: string) =>
    setSelectedTagIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleQueryChange = (val: string) => {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val === "") {
      onApply({ query: "", minPrice, maxPrice, categoryIds: selectedIds, tagIds: selectedTagIds })
    } else {
      debounceRef.current = setTimeout(() => {
        onApply({ query: val, minPrice, maxPrice, categoryIds: selectedIds, tagIds: selectedTagIds })
      }, 350)
    }
  }

  const handleApply = () => {
    onApply({ query, minPrice, maxPrice, categoryIds: selectedIds, tagIds: selectedTagIds })
    setOpen(false)
  }

  const handleReset = () => {
    setQuery("")
    setMinPrice("")
    setMaxPrice("")
    setSelectedIds(defaultCategoryIds)
    setSelectedTagIds([])
    onApply({ query: "", minPrice: "", maxPrice: "", categoryIds: defaultCategoryIds, tagIds: [] })
  }

  return {
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
  }
}
