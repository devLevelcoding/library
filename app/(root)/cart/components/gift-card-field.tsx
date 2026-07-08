import { Loader2, Tag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"

interface GiftCardFieldProps {
  giftCode: string
  onGiftCodeChange: (val: string) => void
  giftDiscount: number
  appliedGift: string
  giftLoading: boolean
  currency: string
  rate: number
  onApply: () => void
  onRemove: () => void
}

export function GiftCardField({
  giftCode, onGiftCodeChange, giftDiscount, appliedGift, giftLoading, currency, rate, onApply, onRemove,
}: GiftCardFieldProps) {
  return (
    <div className="mb-3">
      <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Gift card</p>
      {appliedGift ? (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Tag className="h-3.5 w-3.5" />
            <span className="font-medium">{appliedGift}</span>
            <span>–{formatPrice(giftDiscount, currency, rate)}</span>
          </div>
          <button onClick={onRemove} className="text-green-600 hover:text-green-800">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={giftCode}
            onChange={e => onGiftCodeChange(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && onApply()}
            placeholder="Gift card code"
            className="flex-1 border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button size="sm" variant="outline" onClick={onApply} disabled={giftLoading || !giftCode.trim()}>
            {giftLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
          </Button>
        </div>
      )}
    </div>
  )
}
