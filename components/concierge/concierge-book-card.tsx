"use client"

import Link from "next/link"
import NextImage from "next/image"
import { ShoppingCart } from "lucide-react"
import useCart from "@/hooks/use-cart"
import useCurrency from "@/hooks/use-currency"
import { formatPrice } from "@/lib/utils"
import type { ConciergeBook } from "./use-concierge"

// The cart stores Product-shaped items (cart-item.tsx reads name, price, images[0].url, category.name)
function asCartProduct(b: ConciergeBook) {
  return {
    id: b.id, name: b.title, author: b.author, price: b.price,
    images: b.image ? [{ url: b.image }] : [], category: { name: b.category },
  } as any
}

export function ConciergeBookCard({ book, onNavigate }: { book: ConciergeBook; onNavigate: () => void }) {
  const cart = useCart()
  const { currency, rate } = useCurrency()
  const soldOut = book.in_stock === 0

  return (
    <div className="flex gap-3 rounded-lg border bg-white p-2">
      <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded bg-gray-100">
        {book.image && <NextImage fill src={book.image} alt={book.title} className="object-cover" sizes="56px" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={`/product/${book.id}`} onClick={onNavigate}
              className="truncate text-sm font-semibold hover:underline">{book.title}</Link>
        {book.author && <span className="truncate text-xs text-gray-500">{book.author}</span>}
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-sm font-bold">{formatPrice(book.price, currency, rate)}</span>
          {book.in_stock !== undefined && book.in_stock > 0 && book.in_stock <= 5 && (
            <span className="text-[11px] text-amber-700">Only {book.in_stock} left</span>
          )}
          <button
            type="button" disabled={soldOut}
            onClick={() => cart.addItem(asCartProduct(book))}
            className="flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-xs text-white disabled:opacity-40"
          >
            <ShoppingCart size={12} /> {soldOut ? "Sold out" : "Add"}
          </button>
        </div>
      </div>
    </div>
  )
}
