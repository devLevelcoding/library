import { useRouter } from "next/navigation"
import { Heart, ShoppingCart } from "lucide-react"

interface NavIconsProps {
  wishlistCount: number
  cartCount: number
}

export function NavIcons({ wishlistCount, cartCount }: NavIconsProps) {
  const router = useRouter()

  return (
    <>
      <button
        className="relative flex items-center gap-x-1 text-sm"
        onClick={() => router.push('/wishlist')}
        aria-label="Wishlist"
      >
        <Heart size={20} className={wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""} />
        {wishlistCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {wishlistCount}
          </span>
        )}
      </button>
      <button className="flex items-center gap-x-1 text-sm" onClick={() => router.push('/cart')}>
        <ShoppingCart size={20} />
        {cartCount > 0 && (
          <>({cartCount})</>
        )}
      </button>
    </>
  )
}
