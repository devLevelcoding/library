import ProductCard from "@/components/product-card";
import Billboard from "@/components/ui/billboard";
import NoResults from "@/components/ui/no-results";
import prismadb from "@/lib/prismadb";

export default async function Home() {
  const setting = await prismadb.setting.findFirst() 

  const products = await prismadb.product.findMany({
    where: {
      isFeatured: true,
      isArchived: false,
    },
    include: {
      category: true,
      size: true,
      images: true,
    }
  })

  return (
    <div>
      {setting && <Billboard imageUrl={setting.billboardImageUrl} title={setting.billboardTitle}/>}
    
      {products.length === 0 && <NoResults />}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-10">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  )
}
