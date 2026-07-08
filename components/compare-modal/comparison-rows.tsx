import { formatPrice } from "@/lib/utils"
import { CompareProduct } from "@/hooks/use-compare"

interface ComparisonRowsProps {
  items: CompareProduct[]
  currency: string
  rate: number
}

export function ComparisonRows({ items, currency, rate }: ComparisonRowsProps) {
  const gridStyle = { gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }
  const prices = items.map(i => i.price)
  const lowest = Math.min(...prices)

  return (
    <div className="mt-6 divide-y border rounded-xl overflow-hidden">
      <div className="grid items-center" style={gridStyle}>
        <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/40">Author</div>
        {items.map(item => (
          <div key={item.id} className="px-4 py-3 text-sm">{item.author || "—"}</div>
        ))}
      </div>
      <div className="grid items-center" style={gridStyle}>
        <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/40">Category</div>
        {items.map(item => (
          <div key={item.id} className="px-4 py-3 text-sm">{item.category}</div>
        ))}
      </div>
      <div className="grid items-center" style={gridStyle}>
        <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/40">Price</div>
        {items.map(item => (
          <div key={item.id} className="px-4 py-3 text-sm font-semibold">
            <span className={item.price === lowest ? "text-green-600" : ""}>
              {formatPrice(item.price, currency, rate)}
            </span>
            {item.price === lowest && items.length > 1 && (
              <span className="ml-1 text-[10px] font-medium bg-green-100 text-green-700 rounded px-1">Best</span>
            )}
          </div>
        ))}
      </div>
      <div className="grid items-start" style={gridStyle}>
        <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/40">Tags</div>
        {items.map(item => (
          <div key={item.id} className="px-4 py-3 flex flex-wrap gap-1">
            {item.tags?.slice(0, 4).map(({ tag }) => (
              <span key={tag.name} className="text-[10px] font-medium rounded-full px-2 py-0.5 text-white" style={{ backgroundColor: tag.color }}>
                {tag.name}
              </span>
            )) ?? <span className="text-sm text-muted-foreground">—</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
