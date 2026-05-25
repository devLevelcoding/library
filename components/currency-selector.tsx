"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import useCurrency, { CURRENCIES } from "@/hooks/use-currency"

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleSelect = async (code: string) => {
    setOpen(false)
    if (code === "USD") { setCurrency("USD", 1); return }
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${code}`)
      const data = await res.json()
      const rate = data.rates?.[code] ?? 1
      setCurrency(code, rate)
    } catch {
      setCurrency(code, 1)
    }
  }

  if (!mounted) return null

  const current = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
      >
        <span>{current.symbol}</span>
        <span>{current.code}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border bg-popover shadow-lg overflow-hidden">
            <div className="max-h-64 overflow-y-auto py-1">
              {CURRENCIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => handleSelect(c.code)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left ${c.code === currency ? "bg-accent font-medium" : ""}`}
                >
                  <span className="w-6 text-muted-foreground">{c.symbol}</span>
                  <span>{c.code}</span>
                  <span className="text-xs text-muted-foreground ml-auto truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
