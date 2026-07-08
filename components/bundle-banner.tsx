"use client"

import { useBundleRules } from "@/hooks/use-bundle-rules"
import { AppliedBundleBanner } from "./bundle-banner/applied-bundle-banner"
import { BundleProgressBanner } from "./bundle-banner/bundle-progress-banner"

interface BundleBannerProps {
  itemCount: number
  /** Called when a rule is applied or removed so parent can update total */
  onBundleChange: (discountPercent: number, label: string) => void
}

export function BundleBanner({ itemCount, onBundleChange }: BundleBannerProps) {
  const { rules, appliedRule, nextRule, needed } = useBundleRules(itemCount, onBundleChange)

  if (rules.length === 0) return null

  if (appliedRule) {
    return <AppliedBundleBanner appliedRule={appliedRule} nextRule={nextRule} needed={needed} />
  }

  if (nextRule) {
    return <BundleProgressBanner itemCount={itemCount} rules={rules} nextRule={nextRule} needed={needed} />
  }

  return null
}
