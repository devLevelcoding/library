import { cn } from "@/lib/utils"
import { stockLevel } from "@/lib/stock"

interface StockBadgeProps {
  stock: number
  className?: string
  size?: "sm" | "md"
}

export function StockBadge({ stock, className, size = "sm" }: StockBadgeProps) {
  const level = stockLevel(stock)

  const base = cn(
    "inline-flex items-center font-semibold rounded-full",
    size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
    className
  )

  if (level === "out") {
    return <span className={cn(base, "bg-red-100 text-red-700")}>Out of stock</span>
  }
  if (level === "low") {
    return <span className={cn(base, "bg-amber-100 text-amber-700")}>Only {stock} left</span>
  }
  return <span className={cn(base, "bg-green-100 text-green-700")}>In stock</span>
}
