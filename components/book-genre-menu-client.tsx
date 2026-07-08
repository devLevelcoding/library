"use client"

import { usePathname } from "next/navigation"
import { ChevronDown, BookOpen } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { GenreDropdownPanel } from "./book-genre-menu/genre-dropdown-panel"

interface Genre {
  id: string
  name: string
  icon: string
}

export default function BookGenreMenuClient({ genres }: { genres: Genre[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  if (pathname?.includes("admin")) return null

  const activeGenre = genres.find(g => pathname === `/category/${g.id}`)

  return (
    <div ref={ref} className="relative ml-4">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border transition-all",
          open
            ? "bg-primary text-primary-foreground border-primary"
            : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-accent"
        )}
      >
        <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
        {activeGenre ? activeGenre.name : "Browse Genres"}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <GenreDropdownPanel genres={genres} pathname={pathname} onNavigate={() => setOpen(false)} />
      )}
    </div>
  )
}
