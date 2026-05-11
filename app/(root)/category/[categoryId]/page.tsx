import NoResults from "@/components/ui/no-results";
import ProductGrid from "@/components/product-grid";
import prismadb from "@/lib/prismadb";
import type { Metadata } from "next";

const PAGE_SIZE = 20

export async function generateMetadata({ params }: { params: { categoryId: string } }): Promise<Metadata> {
  const category = await prismadb.category.findUnique({ where: { id: params.categoryId } })
  return {
    title: category?.name ?? "Category",
    description: `Browse all ${category?.name ?? "products"} in our store.`,
  }
}

const CategoryPage = async ({ params }: { params: { categoryId: string } }) => {
  const category = await prismadb.category.findUnique({
    where: { id: params.categoryId },
  })

  if (!category) return null

  const products = await prismadb.product.findMany({
    where: { isArchived: false, categoryId: params.categoryId },
    include: { category: true, size: true, images: true },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  })

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-700">{category.name}</h2>
      {products.length === 0 && <NoResults />}
      <ProductGrid initialProducts={products} categoryId={params.categoryId} pageSize={PAGE_SIZE} />
    </div>
  )
}

export default CategoryPage;