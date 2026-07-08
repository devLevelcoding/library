import Link from "next/link"
import { signOut } from "next-auth/react"
import { Heart, Star } from "lucide-react"
import { User } from "@prisma/client"
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface AccountDropdownProps {
  currentUser: User | null
  pathname: string | null
  wishlistCount: number
  points: number | null
}

export function AccountDropdown({ currentUser, pathname, wishlistCount, points }: AccountDropdownProps) {
  return (
    <DropdownMenuContent>
      {!currentUser && (
        <>
          <DropdownMenuItem>
            <Link href="/sign-in">
              Log In
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/sign-up">
              Sign Up
            </Link>
          </DropdownMenuItem>
        </>
      )}
      {currentUser && (
        <>
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          {(currentUser.role === "admin" && !pathname?.includes('/admin')) && <DropdownMenuItem>
            <Link href="/admin">
              Admin Area
            </Link>
          </DropdownMenuItem>}
          {(currentUser.role === "admin" && pathname?.includes('/admin')) && <DropdownMenuItem>
            <Link href="/">
              Front Area
            </Link>
          </DropdownMenuItem>}
          <DropdownMenuItem>
            <Link href="/my-orders">
              My Orders
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/wishlist" className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" />
              Wishlist
              {wishlistCount > 0 && (
                <span className="ml-auto text-xs text-muted-foreground">{wishlistCount}</span>
              )}
            </Link>
          </DropdownMenuItem>
          {points !== null && (
            <DropdownMenuItem className="flex items-center gap-1.5 text-amber-600 font-medium cursor-default" onSelect={e => e.preventDefault()}>
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {points} loyalty points
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            <button onClick={(e) => { e.stopPropagation(); signOut() }}>
              Sign Out
            </button>
          </DropdownMenuItem>
        </>
      )}

      <DropdownMenuSeparator />
    </DropdownMenuContent>
  )
}
