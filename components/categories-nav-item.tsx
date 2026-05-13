"use client"

import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { ChevronDown } from "lucide-react";

type CategoryWithChildren = Category & { children: Category[] }

interface CategoriesNavItemProps {
  category: CategoryWithChildren
}

const CategoriesNavItem: React.FC<CategoriesNavItemProps> = ({ category }) => {
  const pathname = usePathname()
  const isActive = pathname === `/category/${category.id}`
  // large lists go to the category page sidebar instead of a nav dropdown
  const hasChildren = category.children && category.children.length > 0 && category.children.length <= 5

  return (
    <div className="relative group">
      <Link
        href={`/category/${category.id}`}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          'flex items-center gap-0.5 text-sm font-medium transition-colors hover:text-primary whitespace-nowrap',
          isActive ? 'text-black dark:text-white' : 'text-muted-foreground'
        )}
      >
        {category.name}
        {hasChildren && (
          <ChevronDown className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
        )}
      </Link>

      {hasChildren && (
        <div className="absolute left-0 top-full pt-2 z-50 hidden group-hover:block">
          <div className="min-w-[160px] rounded-md border bg-popover shadow-md py-1">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/category/${child.id}`}
                className={cn(
                  'block px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                  pathname === `/category/${child.id}` ? 'text-black dark:text-white font-medium' : 'text-muted-foreground'
                )}
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoriesNavItem;
