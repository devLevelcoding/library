import Link from "next/link"
import { AdminNav } from "./admin-nav"
import Container from "./ui/container"
import { UserNav } from "./user-nav"
import { User } from "@prisma/client"
import React from "react"
import SearchBar from "./search-bar"
import BookGenreMenu from "./book-genre-menu"
import { BookMarked } from "lucide-react"

interface NavbarProps {
  currentUser: User | null
}

const Navbar: React.FC<NavbarProps> = async ({ currentUser }) => {
  return (
    <header className="bg-white w-full border-b mb-6 fixed z-20">
      <Container>
        <div className="flex h-16 items-center gap-4">
          {/* left: logo + genre menu */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <BookMarked className="h-5 w-5 text-primary transition-transform group-hover:scale-110" aria-hidden="true" />
              <span className="font-bold text-lg tracking-tight">BookStore</span>
            </Link>
            <BookGenreMenu />
          </div>

          {/* center: search */}
          <div className="flex-1 flex justify-center">
            <SearchBar />
          </div>

          {/* right: admin + user */}
          <div className="flex items-center shrink-0 gap-2">
            {currentUser?.role === "admin" && <AdminNav className="mr-2" />}
            <UserNav currentUser={currentUser} />
          </div>
        </div>
      </Container>
    </header>
  )
}

export default Navbar
