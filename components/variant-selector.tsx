"use client"

import { BOOK_VARIANTS, BookVariant, variantPrice } from "@/lib/variants"
import { formatPrice } from "@/lib/utils"
import useCurrency from "@/hooks/use-currency"
import { cn } from "@/lib/utils"

interface VariantSelectorProps {
  basePrice: number
  selected: BookVariant
  onChange: (variant: BookVariant) => void
}

export function VariantSelector({ basePrice, selected, onChange }: VariantSelectorProps) {
  const { currency, rate } = useCurrency()

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">Format</p>
      <div className="grid grid-cols-2 gap-2">
        {BOOK_VARIANTS.map(v => {
          const price = variantPrice(basePrice, v.multiplier)
          const isActive = v.format === selected.format
          return (
            <button
              key={v.format}
              onClick={() => onChange(v)}
              className={cn(
                "flex flex-col items-start gap-0.5 rounded-xl border-2 px-4 py-3 text-left transition-all",
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <span>{v.icon}</span>
                <span>{v.format}</span>
                {v.multiplier < 1 && (
                  <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-50 rounded px-1.5 py-0.5">SAVE</span>
                )}
              </span>
              <span className="text-xs text-muted-foreground">{v.description}</span>
              <span className={cn("text-sm font-bold mt-1", isActive ? "text-primary" : "text-gray-800")}>
                {formatPrice(price, currency, rate)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
