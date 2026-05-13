import Link from "next/link"
import { AdminNav } from "./admin-nav"
import Container from "./ui/container"
import { UserNav } from "./user-nav"
import { User } from "@prisma/client"
import React from "react"
import CategoriesNav from "./categories-nav"
import SearchBar from "./search-bar"

interface NavbarProps {
  currentUser: User | null
}

const Navbar: React.FC<NavbarProps> = async ({ currentUser }) => {
  return (
    <div className="bg-white w-full border-b mb-6 fixed z-20">
      <Container>
        <div className="flex h-16 items-center gap-4">
          {/* left: logo + categories */}
          <div className="flex items-center shrink-0">
            <Link href="/">
              <p className="font-medium text-lg">SHOP</p>
            </Link>
            <CategoriesNav />
          </div>

          {/* center: search */}
          <div className="flex-1 flex justify-center">
            <SearchBar />
          </div>

          {/* right: admin + user */}
          <div className="flex items-center shrink-0">
            {currentUser?.role === "admin" && <AdminNav className="mr-4" />}
            <UserNav currentUser={currentUser} />
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Navbar
