import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "CAD", symbol: "CA$", label: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "CHF", symbol: "Fr", label: "Swiss Franc" },
  { code: "SEK", symbol: "kr", label: "Swedish Krona" },
  { code: "NOK", symbol: "kr", label: "Norwegian Krone" },
  { code: "BRL", symbol: "R$", label: "Brazilian Real" },
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "RON", symbol: "lei", label: "Romanian Leu" },
]

interface CurrencyStore {
  currency: string
  rate: number
  setCurrency: (currency: string, rate: number) => void
}

const useCurrency = create(
  persist<CurrencyStore>(
    (set) => ({
      currency: "USD",
      rate: 1,
      setCurrency: (currency, rate) => set({ currency, rate }),
    }),
    { name: "currency-pref", storage: createJSONStorage(() => localStorage) }
  )
)

export default useCurrency
