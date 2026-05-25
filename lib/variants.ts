export interface BookVariant {
  format: "Paperback" | "Hardcover" | "eBook" | "Audiobook"
  multiplier: number
  description: string
  icon: string
}

export const BOOK_VARIANTS: BookVariant[] = [
  { format: "Paperback",  multiplier: 1.00, description: "Standard softcover edition", icon: "📄" },
  { format: "Hardcover",  multiplier: 1.35, description: "Premium hardbound edition",  icon: "📚" },
  { format: "eBook",      multiplier: 0.70, description: "Instant digital download",   icon: "💻" },
  { format: "Audiobook",  multiplier: 1.15, description: "Narrated audio edition",     icon: "🎧" },
]

export function variantPrice(basePrice: number, multiplier: number) {
  return Math.round(basePrice * multiplier * 100) / 100
}
