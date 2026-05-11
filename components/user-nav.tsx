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
import { ShoppingCart, User as UserIcon } from "lucide-react"
import { Button } from "./ui/button"
import Link from "next/link"
import { User } from "@prisma/client"
import { signOut } from "next-auth/react"
import useCart from "@/hooks/use-cart"
import { useState, useEffect } from "react"
  
interface UserNavProps {
    currentUser: User | null,
}

export const UserNav: React.FC<UserNavProps> = ({
    currentUser,
}) => {
    const [mounted, setMounted] = useState(false)
    const cart = useCart()
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return <nav className='flex items-center space-x-4 lg:space-x-6 ml-auto'>
        {!pathname?.includes('/admin') && (
            <button className="flex items-center gap-x-1 text-sm" onClick={() => router.push('/cart')}>
                <ShoppingCart size={20}/>
                {cart.items.length > 0 && (
                    <>({cart.items.length})</>
                )}
            </button>
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
 