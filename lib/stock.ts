/**
 * Derives a deterministic demo stock level from a product ID.
 * Same product always shows the same badge without any API call —
 * used on product cards to avoid N+1 requests.
 * Real stock is stored in Turso and used on the product detail page.
 */
export function deriveStock(productId: string): number {
  let h = 0
  for (let i = 0; i < productId.length; i++) {
    h = (h * 31 + productId.charCodeAt(i)) & 0xffff
  }
  const bucket = h % 100
  if (bucket < 8)  return 0              // ~8%  out of stock
  if (bucket < 18) return (h % 5) + 1   // ~10% low stock 1–5
  return 99                              // ~82% in stock
}

export type StockLevel = "out" | "low" | "in"

export function stockLevel(stock: number): StockLevel {
  if (stock === 0) return "out"
  if (stock <= 5)  return "low"
  return "in"
}
