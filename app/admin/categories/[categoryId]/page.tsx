import prismadb from "@/lib/prismadb";
import CategoryForm from "./components/category-form";

export const dynamic = 'force-dynamic'

const CategoryEditPage = async ({ params }: { params: Promise<{ categoryId: string }> }) => {
  const { categoryId } = await params
  const [category, allCategories] = await Promise.all([
    prismadb.category.findUnique({ where: { id: categoryId } }),
    prismadb.category.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div>
      <CategoryForm category={category} allCategories={allCategories} />
    </div>
  )
}

export default CategoryEditPage;
