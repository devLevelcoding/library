import Stripe from "stripe"

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_API_KEY) throw new Error("STRIPE_API_KEY is not set")
    _stripe = new Stripe(process.env.STRIPE_API_KEY, {
      apiVersion: "2025-02-24.acacia",
    })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})
