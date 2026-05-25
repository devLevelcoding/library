"use client"

import { useEffect, useState } from "react"
import { Gift, ChevronRight } from "lucide-react"

interface BundleRule {
  id: string
  minQty: number
  discount: number
  label: string
}

interface BundleBannerProps {
  itemCount: number
  /** Called when a rule is applied or removed so parent can update total */
  onBundleChange: (discountPercent: number, label: string) => void
}

export function BundleBanner({ itemCount, onBundleChange }: BundleBannerProps) {
  const [rules, setRules] = useState<BundleRule[]>([])

  useEffect(() => {
    fetch("/api/bundles")
      .then(r => r.json())
      .then(d => setRules(d.rules ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (rules.length === 0) return
    // Find best (highest discount) rule whose minQty is met
    const active = [...rules]
      .filter(r => itemCount >= r.minQty)
      .sort((a, b) => b.discount - a.discount)[0]

    if (active) {
      onBundleChange(active.discount, active.label)
    } else {
      onBundleChange(0, "")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemCount, rules])

  if (rules.length === 0) return null

  // Best active rule
  const appliedRule = [...rules]
    .filter(r => itemCount >= r.minQty)
    .sort((a, b) => b.discount - a.discount)[0]

  // Next rule the user hasn't unlocked yet
  const nextRule = rules.find(r => itemCount < r.minQty)
  const needed = nextRule ? nextRule.minQty - itemCount : 0

  if (appliedRule) {
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

  // Progress toward the first unmet rule
  if (nextRule) {
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

  return null
}
