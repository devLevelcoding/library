import ProductCard from "@/components/product-card";
import NoResults from "@/components/ui/no-results";
import prismadb from "@/lib/prismadb";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { categoryId: string } }): Promise<Metadata> {
  const category = await prismadb.category.findUnique({ where: { id: params.categoryId } })
  return {
    title: category?.name ?? "Category",
    description: `Browse all ${category?.name ?? "products"} in our store.`,
  }
}

const CategoryPage = async ({params} : {
    params: {
        categoryId: string,
    }
}) => {
    const category = await prismadb.category.findUnique({
        where: { id: params.categoryId }
    })

    if (!category) return null

    const products = await prismadb.product.findMany({
        where: {
          isArchived: false,
          categoryId: params.categoryId,
        },
        include: {
          category: true,
          size: true,
          images: true,
        },
        orderBy: { createdAt: "desc" },
      })

      return (
        <div>
          <h2 className="text-2xl font-semibold text-slate-700">{category.name}</h2>
          {products.length === 0 && <NoResults />}
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-10">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      )
}

export default CategoryPage;