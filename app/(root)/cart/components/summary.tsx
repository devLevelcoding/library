"use client"

import { AccountModal } from "@/components/modals/account-modal"
import { Button } from "@/components/ui/button"
import useCart from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import useCurrency from "@/hooks/use-currency"
import { User } from "@prisma/client"
import axios from "axios"
import { useRouter, useSearchParams } from "next/navigation"
import React, { MouseEventHandler, useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Tag, X, Loader2, Ticket } from "lucide-react"
import { BundleBanner } from "@/components/bundle-banner"

interface SummaryProps {
  currentUser: User | null
}

const Summary: React.FC<SummaryProps> = ({ currentUser }) => {
  const [open, setOpen] = useState(false)
  const cart = useCart()
  const { currency, rate } = useCurrency()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Gift card state
  const [giftCode, setGiftCode] = useState("")
  const [giftDiscount, setGiftDiscount] = useState(0)
  const [appliedGift, setAppliedGift] = useState("")
  const [giftLoading, setGiftLoading] = useState(false)

  // Discount code state
  const [discountCode, setDiscountCode] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountLabel, setDiscountLabel] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState("")
  const [discountLoading, setDiscountLoading] = useState(false)

  // Bundle pricing state (auto-applied)
  const [bundlePercent, setBundlePercent] = useState(0)
  const [bundleLabel, setBundleLabel] = useState("")

  const subtotal = cart.items.reduce((total, item) => total + Number(item.price), 0)
  const bundleDiscount = bundlePercent > 0 ? Math.round(subtotal * bundlePercent) / 100 : 0
  const total = Math.max(0, subtotal - giftDiscount - discountAmount - bundleDiscount)

  useEffect(() => {
    if (searchParams?.get("success")) { toast.success("Payment completed!"); cart.removeAll() }
    if (searchParams?.get("cancelled")) toast.error("Something went wrong")
  }, [searchParams, cart, cart.removeAll])

  // ── Gift card ──
  const applyGiftCard = async () => {
    if (!giftCode.trim()) return
    setGiftLoading(true)
    try {
      const res = await fetch("/api/gift-cards/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: giftCode }),
      })
      const data = await res.json()
      if (data.valid) {
        setGiftDiscount(data.amount)
        setAppliedGift(data.code)
        setGiftCode("")
        toast.success(`Gift card applied! –${formatPrice(data.amount, currency, rate)} discount`)
      } else {
        toast.error(data.error ?? "Invalid code")
      }
    } catch {
      toast.error("Could not validate gift card")
    } finally {
      setGiftLoading(false)
    }
  }

  const removeGiftCard = () => { setGiftDiscount(0); setAppliedGift("") }

  // ── Discount code ──
  const applyDiscount = async () => {
    if (!discountCode.trim()) return
    setDiscountLoading(true)
    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode, subtotal }),
      })
      const data = await res.json()
      if (data.valid) {
        setDiscountAmount(data.discountAmount)
        setDiscountLabel(data.label)
        setAppliedDiscount(data.code)
        setDiscountCode("")
        toast.success(`Discount applied! ${data.label}`)
      } else {
        toast.error(data.error ?? "Invalid discount code")
      }
    } catch {
      toast.error("Could not validate discount code")
    } finally {
      setDiscountLoading(false)
    }
  }

  const removeDiscount = () => { setDiscountAmount(0); setDiscountLabel(""); setAppliedDiscount("") }

  const onRemoveAll: MouseEventHandler<HTMLButtonElement> = (e) => { e.stopPropagation(); cart.removeAll() }
  const onCheckout = () => { !currentUser?.id ? setOpen(true) : checkout() }
  const checkout = async () => {
    const response = await axios.post("/api/checkout", { productsId: cart.items.map(i => i.id) })
    window.location = response.data.url
  }

  return (
    <>
      <div className="bg-gray-50 px-5 py-5 rounded-lg">

        {/* ── Bundle pricing progress / applied banner ── */}
        <BundleBanner
          itemCount={cart.items.length}
          onBundleChange={(pct, lbl) => { setBundlePercent(pct); setBundleLabel(lbl) }}
        />

        {/* ── Gift card ── */}
        <div className="mb-3">
          <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Gift card</p>
          {appliedGift ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Tag className="h-3.5 w-3.5" />
                <span className="font-medium">{appliedGift}</span>
                <span>–{formatPrice(giftDiscount, currency, rate)}</span>
              </div>
              <button onClick={removeGiftCard} className="text-green-600 hover:text-green-800">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={giftCode}
                onChange={e => setGiftCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && applyGiftCard()}
                placeholder="Gift card code"
                className="flex-1 border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button size="sm" variant="outline" onClick={applyGiftCard} disabled={giftLoading || !giftCode.trim()}>
                {giftLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
              </Button>
            </div>
          )}
        </div>

        {/* ── Discount code ── */}
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
              <button onClick={removeDiscount} className="text-blue-600 hover:text-blue-800">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={discountCode}
                onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && applyDiscount()}
                placeholder="Discount / coupon code"
                className="flex-1 border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button size="sm" variant="outline" onClick={applyDiscount} disabled={discountLoading || !discountCode.trim()}>
                {discountLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
              </Button>
            </div>
          )}
        </div>

        {/* ── Totals ── */}
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
