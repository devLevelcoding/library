import { Gift } from "lucide-react"
import { BundleRule } from "@/hooks/use-bundle-rules"

interface AppliedBundleBannerProps {
  appliedRule: BundleRule
  nextRule?: BundleRule
  needed: number
}

export function AppliedBundleBanner({ appliedRule, nextRule, needed }: AppliedBundleBannerProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 mb-4">
      <Gift className="h-4 w-4 text-emerald-600 shrink-0" />
      <div className="flex-1 text-sm">
        <span className="font-semibold text-emerald-700">{appliedRule.label}</span>
        <span className="text-emerald-600"> applied automatically</span>
      </div>
      {nextRule && (
        <span className="text-xs text-emerald-500 shrink-0">
          +{needed} for {nextRule.discount}%
        </span>
      )}
    </div>
  )
}
