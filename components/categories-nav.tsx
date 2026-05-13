import prismadb from "@/lib/prismadb";
import CategoriesNavList from "./categories-nav-list";
import type { Category } from "@prisma/client";

type CategoryWithChildren = Category & { children: Category[] }

const CategoriesNav = async () => {
  let categories: CategoryWithChildren[] = []
  try {
    categories = await prismadb.category.findMany({
      where: { enabled: true, parentId: null },
      include: {
        children: {
          where: { enabled: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    })
  } catch {
    // DB not available at build time (e.g. Vercel build without DB)
  }

  return <CategoriesNavList categories={categories} />
}

export default CategoriesNav;
