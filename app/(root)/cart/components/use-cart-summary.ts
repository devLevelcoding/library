import { MouseEventHandler, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "react-hot-toast"
import axios from "axios"
import useCart from "@/hooks/use-cart"
import useCurrency from "@/hooks/use-currency"
import { formatPrice } from "@/lib/utils"

export function useCartSummary() {
  const cart = useCart()
  const { currency, rate } = useCurrency()
  const searchParams = useSearchParams()

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

  const checkout = async () => {
    const response = await axios.post("/api/checkout", { productsId: cart.items.map(i => i.id) })
    window.location = response.data.url
  }

  return {
    cart, currency, rate,
    giftCode, setGiftCode, giftDiscount, appliedGift, giftLoading, applyGiftCard, removeGiftCard,
    discountCode, setDiscountCode, discountAmount, discountLabel, appliedDiscount, discountLoading, applyDiscount, removeDiscount,
    bundleDiscount, bundleLabel, setBundlePercent, setBundleLabel,
    subtotal, total,
    onRemoveAll, checkout,
  }
}
