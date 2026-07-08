import { ChevronRight } from "lucide-react"
import { BundleRule } from "@/hooks/use-bundle-rules"

interface BundleProgressBannerProps {
  itemCount: number
  rules: BundleRule[]
  nextRule: BundleRule
  needed: number
}

export function BundleProgressBanner({ itemCount, rules, nextRule, needed }: BundleProgressBannerProps) {
  const prevRule = [...rules].filter(r => r.minQty < nextRule.minQty).pop()
  const start = prevRule ? prevRule.minQty : 0
  const progress = Math.min(1, (itemCount - start) / (nextRule.minQty - start))

  return (
    <div className="mb-4 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-amber-700">
          Add {needed} more book{needed > 1 ? "s" : ""} →
          <span className="font-bold"> {nextRule.label}</span>
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-amber-400" />
      </div>
      <div className="h-1.5 rounded-full bg-amber-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-amber-500">
        <span>{itemCount} book{itemCount !== 1 ? "s" : ""}</span>
        <span>{nextRule.minQty} to unlock</span>
      </div>
    </div>
  )
}
