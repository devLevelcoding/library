"use client"

import { useState, useEffect } from "react"
import { X, ArrowLeftRight } from "lucide-react"
import Image from "next/image"
import useCompare from "@/hooks/use-compare"
import { formatPrice } from "@/lib/utils"
import useCurrency from "@/hooks/use-currency"
import { CompareModal } from "./compare-modal"
import { Button } from "./ui/button"

export function CompareBar() {
  const { items, removeItem, clearAll } = useCompare()
  const { currency, rate } = useCurrency()
  const [mounted, setMounted] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted || items.length === 0) return null

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <span className="text-sm font-semibold text-muted-foreground shrink-0">
            Compare ({items.length}/3)
          </span>

          <div className="flex-1 flex items-center gap-3 overflow-x-auto">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-muted/40 shrink-0">
                {item.image && (
                  <div className="relative h-8 w-8 rounded overflow-hidden">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate max-w-[120px]">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(item.price, currency, rate)}</p>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-foreground ml-1">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {Array.from({ length: 3 - items.length }).map((_, i) => (
              <div key={i} className="flex items-center justify-center border border-dashed rounded-lg px-6 py-1.5 text-xs text-muted-foreground shrink-0 h-[44px]">
                + Add book
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={clearAll} className="text-xs">Clear</Button>
            <Button size="sm" onClick={() => setShowModal(true)} disabled={items.length < 2} className="flex items-center gap-1.5 text-xs">
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Compare
            </Button>
          </div>
        </div>
      </div>

      {showModal && <CompareModal onClose={() => setShowModal(false)} />}
    </>
  )
}
