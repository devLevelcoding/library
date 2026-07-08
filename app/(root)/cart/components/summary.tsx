"use client"

import { AccountModal } from "@/components/modals/account-modal"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { User } from "@prisma/client"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { BundleBanner } from "@/components/bundle-banner"
import { useCartSummary } from "./use-cart-summary"
import { GiftCardField } from "./gift-card-field"
import { DiscountCodeField } from "./discount-code-field"
import { CartTotals } from "./cart-totals"

interface SummaryProps {
  currentUser: User | null
}

const Summary: React.FC<SummaryProps> = ({ currentUser }) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const {
    cart, currency, rate,
    giftCode, setGiftCode, giftDiscount, appliedGift, giftLoading, applyGiftCard, removeGiftCard,
    discountCode, setDiscountCode, discountAmount, discountLabel, appliedDiscount, discountLoading, applyDiscount, removeDiscount,
    bundleDiscount, bundleLabel, setBundlePercent, setBundleLabel,
    subtotal, total,
    onRemoveAll, checkout,
  } = useCartSummary()

  const onCheckout = () => { !currentUser?.id ? setOpen(true) : checkout() }

  return (
    <>
      <div className="bg-gray-50 px-5 py-5 rounded-lg">
        <BundleBanner
          itemCount={cart.items.length}
          onBundleChange={(pct, lbl) => { setBundlePercent(pct); setBundleLabel(lbl) }}
        />

        <GiftCardField
          giftCode={giftCode}
          onGiftCodeChange={setGiftCode}
          giftDiscount={giftDiscount}
          appliedGift={appliedGift}
          giftLoading={giftLoading}
          currency={currency}
          rate={rate}
          onApply={applyGiftCard}
          onRemove={removeGiftCard}
        />

        <DiscountCodeField
          discountCode={discountCode}
          onDiscountCodeChange={setDiscountCode}
          discountAmount={discountAmount}
          discountLabel={discountLabel}
          appliedDiscount={appliedDiscount}
          discountLoading={discountLoading}
          currency={currency}
          rate={rate}
          onApply={applyDiscount}
          onRemove={removeDiscount}
        />

        <CartTotals
          subtotal={subtotal}
          giftDiscount={giftDiscount}
          appliedGift={appliedGift}
          discountAmount={discountAmount}
          appliedDiscount={appliedDiscount}
          bundleDiscount={bundleDiscount}
          bundleLabel={bundleLabel}
          currency={currency}
          rate={rate}
        />

        <hr className="my-3" />

        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold">Total</span>
            <span className="font-bold text-lg">{formatPrice(total, currency, rate)}</span>
          </div>
          <div className="flex justify-end pr-4">
            <span className="text-sm text-gray-600 font-light">including VAT</span>
          </div>
          <Button onClick={onRemoveAll} variant="outline" className="text-muted-foreground hover:text-muted-foreground">
            Empty Cart
          </Button>
          <Button onClick={onCheckout}>Checkout</Button>
        </div>
      </div>
      <AccountModal loading={false} isOpen={open} onConfirm={() => router.push("/sign-up")} onClose={() => setOpen(false)} />
    </>
  )
}

export default Summary
