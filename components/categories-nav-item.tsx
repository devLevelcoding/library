"use client"

import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface CategoriesNavItemProps {
    category: Category
}

const CategoriesNavItem: React.FC<CategoriesNavItemProps> = ({
    category,
}) => {
    const pathname = usePathname()

    return (<Link
        key={category.id}
        href={`/category/${category.id}`}
        className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === `/${category.id}` ? 'text-black dark:text-white' : 'text-muted-foreground'
        )}
    >
        {category.name}
    </Link>);
}
 
export default CategoriesNavItem;