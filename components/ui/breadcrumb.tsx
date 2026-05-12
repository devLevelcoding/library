import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import React from "react"

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-sm text-muted-foreground mb-4">
      <Link href="/" className="hover:text-foreground flex items-center">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors truncate max-w-[200px]">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="text-foreground font-medium truncate max-w-[200px]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
