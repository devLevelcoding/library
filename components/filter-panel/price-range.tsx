import { formatter } from "@/lib/utils"

interface PriceRangeProps {
  absoluteMin: number
  absoluteMax: number
  minPrice: string
  maxPrice: string
  onMinPriceChange: (val: string) => void
  onMaxPriceChange: (val: string) => void
}

export function PriceRange({ absoluteMin, absoluteMax, minPrice, maxPrice, onMinPriceChange, onMaxPriceChange }: PriceRangeProps) {
  return (
    <div className="min-w-[200px]">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Price range</p>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground" aria-hidden="true">$</span>
          <label htmlFor="filter-min-price" className="sr-only">Minimum price</label>
          <input id="filter-min-price" type="number" min={0}
            placeholder={String(Math.floor(absoluteMin))} value={minPrice}
            onChange={e => onMinPriceChange(e.target.value)}
            className="w-full border rounded-md pl-6 pr-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <span className="text-muted-foreground text-sm" aria-hidden="true">—</span>
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground" aria-hidden="true">$</span>
          <label htmlFor="filter-max-price" className="sr-only">Maximum price</label>
          <input id="filter-max-price" type="number" min={0}
            placeholder={String(Math.ceil(absoluteMax))} value={maxPrice}
            onChange={e => onMaxPriceChange(e.target.value)}
            className="w-full border rounded-md pl-6 pr-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Range: {formatter.format(absoluteMin)} – {formatter.format(absoluteMax)}
      </p>
    </div>
  )
}
