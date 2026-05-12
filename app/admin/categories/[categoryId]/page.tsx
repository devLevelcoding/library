import prismadb from "@/lib/prismadb";
import CategoryForm from "./components/category-form";

const CategoryEditPage = async ({ params }: { params: { categoryId: string } }) => {
  const [category, allCategories] = await Promise.all([
    prismadb.category.findUnique({ where: { id: params.categoryId } }),
    prismadb.category.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div>
      <CategoryForm category={category} allCategories={allCategories} />
    </div>
  )
}

export default CategoryEditPage;
