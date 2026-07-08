import { useEffect, useState } from "react"

export interface BundleRule {
  id: string
  minQty: number
  discount: number
  label: string
}

export function useBundleRules(itemCount: number, onBundleChange: (discountPercent: number, label: string) => void) {
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

  const appliedRule = [...rules]
    .filter(r => itemCount >= r.minQty)
    .sort((a, b) => b.discount - a.discount)[0]

  const nextRule = rules.find(r => itemCount < r.minQty)
  const needed = nextRule ? nextRule.minQty - itemCount : 0

  return { rules, appliedRule, nextRule, needed }
}
