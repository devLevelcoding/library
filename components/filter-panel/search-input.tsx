import { Search, X } from "lucide-react"

interface SearchInputProps {
  query: string
  onQueryChange: (val: string) => void
}

export function SearchInput({ query, onQueryChange }: SearchInputProps) {
  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
      <label htmlFor="category-search" className="sr-only">Search within this category</label>
      <input
        id="category-search"
        type="text"
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        placeholder="Search by title or author..."
        className="w-full rounded-full border border-input bg-background pl-9 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition"
      />
      {query && (
        <button onClick={() => onQueryChange("")} aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
