import prismadb from "@/lib/prismadb";
import { CategoryColumn } from "./components/columns";
import { format } from "date-fns";
import { CategoryClient } from "./components/client";

export const dynamic = 'force-dynamic'

const CategoriesPage = async () => {
  let formattedCategories: CategoryColumn[] = []
  try {
    const categories = await prismadb.category.findMany({
      include: { parent: true },
      orderBy: { name: "asc" },
    })
    formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      parent: category.parent?.name ?? "",
      enabled: category.enabled,
      createdAt: format(category.createdAt, "MMMM do, yyyy"),
    }))
  } catch {}

  return (
    <div>
      <CategoryClient data={formattedCategories} key="name" />
    </div>
  )
}

export default CategoriesPage;
