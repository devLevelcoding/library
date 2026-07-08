import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react"
import { formatter } from "@/lib/utils"

interface Tag { id: string; name: string; slug: string; color: string; group: string }

interface ActiveFilterRowProps {
  open: boolean
  onToggleOpen: () => void
  hasActiveFilters: boolean
  onReset: () => void
  activeTags: Tag[]
  onToggleTag: (id: string) => void
  minPrice: string
  maxPrice: string
}

export function ActiveFilterRow({
  open, onToggleOpen, hasActiveFilters, onReset, activeTags, onToggleTag, minPrice, maxPrice,
}: ActiveFilterRowProps) {
  return (
    <div className="flex items-center flex-wrap gap-2">
      <button
        onClick={onToggleOpen}
        className="flex items-center gap-2 text-sm font-medium border rounded-lg px-3 py-1.5 hover:bg-accent transition-colors shrink-0"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-primary" />}
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {hasActiveFilters && (
        <button onClick={onReset}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <X className="h-3 w-3" /> Clear all
        </button>
      )}

      {activeTags.map(t => (
        <button key={t.id} onClick={() => onToggleTag(t.id)}
          className="flex items-center gap-1 text-xs text-white rounded-full px-2.5 py-0.5 hover:opacity-80 transition-opacity"
          style={{ backgroundColor: t.color }}>
          {t.name} <X className="h-2.5 w-2.5" />
        </button>
      ))}
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
    </div>
  )
}
