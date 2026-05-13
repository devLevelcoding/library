"use client"

import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";
import { usePathname } from "next/navigation";
import React from "react";
import CategoriesNavItem from "./categories-nav-item";

type CategoryWithChildren = Category & { children: Category[] }

interface CategoriesNavListProps {
  categories: CategoryWithChildren[]
}

const CategoriesNavList: React.FC<CategoriesNavListProps> = ({ categories }) => {
  const pathname = usePathname()

  if (pathname?.includes('admin')) return null

  return (
    <nav aria-label="Main navigation" className={cn('flex items-center space-x-4 lg:space-x-6 ml-4')}>
      {categories.map((category) => (
        <CategoriesNavItem
          key={category.id}
          category={category}
        />
      ))}
    </nav>
  )
}

export default CategoriesNavList;
