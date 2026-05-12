"use client"

import { Category } from "@prisma/client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type LeafCategory = Category
type GroupCategory = Category & { children: LeafCategory[] }
type RootCategory = Category & { children: GroupCategory[] }

interface CategorySidebarProps {
  root: RootCategory
  activeId: string
}

export function CategorySidebar({ root, activeId }: CategorySidebarProps) {
  const pathname = usePathname()
  const isActive = (id: string) => pathname === `/category/${id}` || activeId === id

  // determine which group contains the active category
  const activeGroupId = (root.children ?? []).find(
    g => g.id === activeId || (g.children ?? []).some(c => c.id === activeId)
  )?.id

  return (
    <aside className="w-52 shrink-0" aria-label="Category navigation">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
        {/* root link */}
        <Link
          href={`/category/${root.id}`}
          className={cn(
            "block px-3 py-1.5 rounded-md text-sm font-semibold mb-2 transition-colors hover:bg-accent hover:text-accent-foreground",
            isActive(root.id) ? "bg-accent text-accent-foreground" : "text-foreground"
          )}
        >
          All {root.name}
        </Link>

        <ul className="space-y-3">
          {(root.children ?? []).map(group => (
            <li key={group.id}>
              {/* group heading — clickable */}
              <Link
                href={`/category/${group.id}`}
                className={cn(
                  "block px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors hover:text-foreground",
                  isActive(group.id) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {group.name}
              </Link>

              {/* children of this group */}
              {(group.children ?? []).length > 0 && (
                <ul className="mt-0.5 space-y-0.5">
                  {(group.children ?? []).map(leaf => (
                    <li key={leaf.id}>
                      <Link
                        href={`/category/${leaf.id}`}
                        className={cn(
                          "block pl-5 pr-3 py-1.5 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                          isActive(leaf.id)
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {leaf.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
