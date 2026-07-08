import Link from "next/link"
import { cn } from "@/lib/utils"

interface Genre {
  id: string
  name: string
  icon: string
}

interface GenreDropdownPanelProps {
  genres: Genre[]
  pathname: string | null
  onNavigate: () => void
}

export function GenreDropdownPanel({ genres, pathname, onNavigate }: GenreDropdownPanelProps) {
  return (
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
          onClick={onNavigate}
        >
          View all books
        </Link>
      </div>
    </div>
  )
}
