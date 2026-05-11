import Link from "next/link"
import {AdminNav} from "./admin-nav"
import Container from "./ui/container"
import { UserNav } from "./user-nav"
import { User } from "@prisma/client"
import React from "react"
import CategoriesNav from "./categories-nav"

interface NavbarProps {
    currentUser: User | null
}

const Navbar: React.FC<NavbarProps> = async ({
    currentUser,
}) => {
    return (
        <div className="bg-white w-full border-b mb-6 fixed z-20">
            <Container>
                <div className="flex h-16 items-center">
                    <Link href="/">
                        <p className="font-medium text-lg">SHOP</p>
                    </Link>
                    <CategoriesNav />
                    {currentUser?.role === "admin" && (
                        <AdminNav className="mx-6"/>
                    )}
                    <UserNav currentUser={currentUser}/>
                </div>    
            </Container>
        </div>
    )
}
 
export default Navbar