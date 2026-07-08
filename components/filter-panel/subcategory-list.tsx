interface Subcategory { id: string; name: string }

interface SubcategoryListProps {
  subcategories: Subcategory[]
  selectedIds: string[]
  defaultCategoryIds: string[]
  onToggleId: (id: string) => void
  onSelectAll: () => void
}

export function SubcategoryList({ subcategories, selectedIds, defaultCategoryIds, onToggleId, onSelectAll }: SubcategoryListProps) {
  if (subcategories.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categories</p>
        {selectedIds.length < defaultCategoryIds.length && (
          <button onClick={onSelectAll} className="text-xs text-primary hover:underline">Select all</button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 max-h-40 overflow-y-auto">
        {subcategories.map(sub => (
          <label key={sub.id} className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" checked={selectedIds.includes(sub.id)}
              onChange={() => onToggleId(sub.id)}
              className="rounded border-gray-300 text-primary focus:ring-primary" />
            <span className="text-sm group-hover:text-foreground text-muted-foreground transition-colors truncate">
              {sub.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
