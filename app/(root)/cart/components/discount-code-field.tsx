import { Loader2, Ticket, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"

interface DiscountCodeFieldProps {
  discountCode: string
  onDiscountCodeChange: (val: string) => void
  discountAmount: number
  discountLabel: string
  appliedDiscount: string
  discountLoading: boolean
  currency: string
  rate: number
  onApply: () => void
  onRemove: () => void
}

export function DiscountCodeField({
  discountCode, onDiscountCodeChange, discountAmount, discountLabel, appliedDiscount, discountLoading, currency, rate, onApply, onRemove,
}: DiscountCodeFieldProps) {
  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Discount code</p>
      {appliedDiscount ? (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Ticket className="h-3.5 w-3.5" />
            <span className="font-medium">{appliedDiscount}</span>
            <span className="text-blue-500">({discountLabel})</span>
            <span>–{formatPrice(discountAmount, currency, rate)}</span>
          </div>
          <button onClick={onRemove} className="text-blue-600 hover:text-blue-800">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={discountCode}
            onChange={e => onDiscountCodeChange(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && onApply()}
            placeholder="Discount / coupon code"
            className="flex-1 border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button size="sm" variant="outline" onClick={onApply} disabled={discountLoading || !discountCode.trim()}>
            {discountLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
          </Button>
        </div>
      )}
    </div>
  )
}
