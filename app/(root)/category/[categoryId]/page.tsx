import ProductCard from "@/components/product-card";
import NoResults from "@/components/ui/no-results";
import prismadb from "@/lib/prismadb";

const CategoryPage = async ({params} : {
    params: {
        categoryId: string,
    }
}) => {
    const category = await prismadb.category.findUnique({
        where: {
            id: params.categoryId,
        }
    })

    if (!category) return null

    const products = await prismadb.product.findMany({
        where: {
          isFeatured: true,
          isArchived: false,
          categoryId: params.categoryId,
        },
        include: {
          category: true,
          size: true,
          images: true,
        }
      })
    
      return (
        <div>        
          <h2 className="text-2xl font-sembiold text-slate-700">{ category?.name }</h2>
          {/* Featured Products */}
          {products.length === 0 && <NoResults />}
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-10">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      )
}
 
export default CategoryPage;