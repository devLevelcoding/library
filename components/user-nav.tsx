"use client"

import { usePathname, useRouter } from "next/navigation"

import {
    DropdownMenu,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { User as UserIcon } from "lucide-react"
import { Button } from "./ui/button"
import { User } from "@prisma/client"
import useCart from "@/hooks/use-cart"
import useWishlist from "@/hooks/use-wishlist"
import { useState, useEffect } from "react"
import { NavIcons } from "./user-nav/nav-icons"
import { AccountDropdown } from "./user-nav/account-dropdown"

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

    useEffect(() => {
        setMounted(true)
        if (currentUser) {
            fetch("/api/loyalty").then(r => r.json()).then(d => setPoints(d.points)).catch(() => {})
        }
    }, [currentUser])

    if (!mounted) return null

    return <nav className='flex items-center space-x-4 lg:space-x-6 ml-auto'>
        {!pathname?.includes('/admin') && (
            <NavIcons wishlistCount={wishlist.items.length} cartCount={cart.items.length} />
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
            <AccountDropdown
                currentUser={currentUser}
                pathname={pathname}
                wishlistCount={wishlist.items.length}
                points={points}
            />
        </DropdownMenu>
    </nav>
}
