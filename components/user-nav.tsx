"use client"

import { usePathname, useRouter } from "next/navigation"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { ShoppingCart, User as UserIcon, Star, Heart } from "lucide-react"
import { Button } from "./ui/button"
import Link from "next/link"
import { User } from "@prisma/client"
import { signOut } from "next-auth/react"
import useCart from "@/hooks/use-cart"
import useWishlist from "@/hooks/use-wishlist"
import { useState, useEffect } from "react"
  
interface UserNavProps {
    currentUser: User | null,
}

export const UserNav: React.FC<UserNavProps> = ({
    currentUser,
}) => {
    const [mounted, setMounted] = useState(false)
    const [points, setPoints] = useState<number | null>(null)
    const cart = useCart()
    const wishlist = useWishlist()
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
        if (currentUser) {
            fetch("/api/loyalty").then(r => r.json()).then(d => setPoints(d.points)).catch(() => {})
        }
    }, [currentUser])

    if (!mounted) return null

    return <nav className='flex items-center space-x-4 lg:space-x-6 ml-auto'>
        {!pathname?.includes('/admin') && (
            <>
              <button
                className="relative flex items-center gap-x-1 text-sm"
                onClick={() => router.push('/wishlist')}
                aria-label="Wishlist"
              >
                <Heart size={20} className={wishlist.items.length > 0 ? "fill-rose-500 text-rose-500" : ""} />
                {wishlist.items.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {wishlist.items.length}
                  </span>
                )}
              </button>
              <button className="flex items-center gap-x-1 text-sm" onClick={() => router.push('/cart')}>
                  <ShoppingCart size={20}/>
                  {cart.items.length > 0 && (
                      <>({cart.items.length})</>
                  )}
              </button>
            </>
        )}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='secondary'>
                    <UserIcon className="w-4 h-4 mr-1"/>
                    {currentUser && (
                        <span>{currentUser.last_name}</span>
                    )}
                    {!currentUser && (
                        <span>Account</span>
                    )}
                </Button>
            </DropdownMenuTrigger>
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
                                {wishlist.items.length > 0 && (
                                    <span className="ml-auto text-xs text-muted-foreground">{wishlist.items.length}</span>
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
                            <button onClick={(e) => {e.stopPropagation(); signOut()}}>
                                Sign Out
                            </button>
                        </DropdownMenuItem>
                    </>
                )}

                <DropdownMenuSeparator />
            </DropdownMenuContent>
        </DropdownMenu>
    </nav>
}
 