"use client"

import { useState } from "react"
import { Bell, BellOff, Loader2, CheckCircle } from "lucide-react"
import { Button } from "./ui/button"

interface StockAlertFormProps {
  productId: string
  productName: string
  defaultEmail?: string
}

export function StockAlertForm({ productId, productName, defaultEmail = "" }: StockAlertFormProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState(defaultEmail)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/stock-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), productId, productName }),
      })
      const data = await res.json()
      if (data.ok) { setDone(true); setOpen(false) }
      else setError(data.error ?? "Something went wrong")
    } catch {
      setError("Could not subscribe. Try again.")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
        <CheckCircle className="h-4 w-4" />
        We'll notify you when it's back in stock
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {!open ? (
        <Button variant="outline" onClick={() => setOpen(true)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          Notify me when back in stock
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-700">Get notified when available:</p>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Notify me"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              <BellOff className="h-4 w-4" />
            </Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </form>
      )}
    </div>
  )
}
