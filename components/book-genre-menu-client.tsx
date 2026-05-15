"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, BookOpen } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Genre {
  id: string
  name: string
  icon: string
}

export default function BookGenreMenuClient({ genres }: { genres: Genre[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  if (pathname?.includes("admin")) return null

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
        <div
          role="menu"
          className="absolute left-0 top-full mt-2 z-50 w-[520px] rounded-xl border bg-popover shadow-xl overflow-hidden"
        >
          <div className="px-4 py-3 border-b bg-muted/40">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Browse by Genre
            </p>
          </div>
          <div className="grid grid-cols-3 gap-px bg-border p-px">
            {genres.map(genre => {
              const isActive = pathname === `/category/${genre.id}`
              return (
                <Link
                  key={genre.id}
                  href={`/category/${genre.id}`}
                  role="menuitem"
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-3 text-sm transition-colors bg-popover",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-accent hover:text-accent-foreground text-foreground/80"
                  )}
                >
                  <span className="text-base leading-none" aria-hidden="true">{genre.icon}</span>
                  <span className="leading-tight">{genre.name}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                  )}
                </Link>
              )
            })}
          </div>
          <div className="px-4 py-2.5 border-t bg-muted/30 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{genres.length} genres · 9,509 books</span>
            <Link
              href="/"
              className="text-xs text-primary hover:underline font-medium"
              onClick={() => setOpen(false)}
            >
              View all books
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
