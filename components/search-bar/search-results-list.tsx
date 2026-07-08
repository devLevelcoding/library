import { formatter } from "@/lib/utils"
import { SearchResult } from "@/hooks/use-search-bar"

interface SearchResultsListProps {
  results: SearchResult[]
  activeIdx: number
  onHover: (idx: number) => void
  onSelect: (product: SearchResult) => void
}

export function SearchResultsList({ results, activeIdx, onHover, onSelect }: SearchResultsListProps) {
  return (
    <div id="search-listbox" role="listbox" aria-label="Search results" className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border bg-popover shadow-lg overflow-hidden">
      {results.map((product, idx) => {
        const imgUrl = product.images[0]?.url
        return (
          <button
            key={product.id}
            onMouseDown={() => onSelect(product)}
            onMouseEnter={() => onHover(idx)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
              idx === activeIdx ? "bg-accent" : "hover:bg-accent/50"
            }`}
          >
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
  )
}
