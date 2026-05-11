import ProductCard from "@/components/product-card";
import Billboard from "@/components/ui/billboard";
import NoResults from "@/components/ui/no-results";
import prismadb from "@/lib/prismadb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Browse thousands of products across beauty, electronics, fashion and more.",
}

export default async function Home() {
  const setting = await prismadb.setting.findFirst()

  const products = await prismadb.product.findMany({
    where: {
      isArchived: false,
    },
    include: {
      category: true,
      size: true,
      images: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return (
    <div>
      {setting && <Billboard imageUrl={setting.billboardImageUrl} title={setting.billboardTitle}/>}
    
      {products.length === 0 && <NoResults />}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-10">
        {products.map((product, i) => <ProductCard key={product.id} product={product} priority={i === 0} />)}
      </div>
    </div>
  )
}
