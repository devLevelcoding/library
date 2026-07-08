import { formatPrice } from "@/lib/utils"

interface CartTotalsProps {
  subtotal: number
  giftDiscount: number
  appliedGift: string
  discountAmount: number
  appliedDiscount: string
  bundleDiscount: number
  bundleLabel: string
  currency: string
  rate: number
}

export function CartTotals({
  subtotal, giftDiscount, appliedGift, discountAmount, appliedDiscount, bundleDiscount, bundleLabel, currency, rate,
}: CartTotalsProps) {
  return (
    <div className="text-gray-700 flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-md">Subtotal</span>
        <span>{formatPrice(subtotal, currency, rate)}</span>
      </div>
      {giftDiscount > 0 && (
        <div className="flex justify-between items-center text-green-600">
          <span className="text-md">Gift card ({appliedGift})</span>
          <span>–{formatPrice(giftDiscount, currency, rate)}</span>
        </div>
      )}
      {discountAmount > 0 && (
        <div className="flex justify-between items-center text-blue-600">
          <span className="text-md">Discount ({appliedDiscount})</span>
          <span>–{formatPrice(discountAmount, currency, rate)}</span>
        </div>
      )}
      {bundleDiscount > 0 && (
        <div className="flex justify-between items-center text-emerald-600">
          <span className="text-md">Bundle ({bundleLabel})</span>
          <span>–{formatPrice(bundleDiscount, currency, rate)}</span>
        </div>
      )}
      <div className="flex justify-between items-center">
        <span className="text-md">Shipping</span>
        <span>Free</span>
      </div>
    </div>
  )
}
