import Billboard from "@/components/ui/billboard";
import NoResults from "@/components/ui/no-results";
import ProductGrid from "@/components/product-grid";
import prismadb from "@/lib/prismadb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Browse thousands of products across beauty, electronics, fashion and more.",
}

const PAGE_SIZE = 20

export default async function Home() {
  const setting = await prismadb.setting.findFirst()

  const products = await prismadb.product.findMany({
    where: { isArchived: false, images: { some: { url: { startsWith: "http" } } } },
    include: { category: true, size: true, images: true },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  })

  return (
    <div>
      {setting && <Billboard imageUrl={setting.billboardImageUrl} title={setting.billboardTitle} />}
      {products.length === 0 && <NoResults />}
      <ProductGrid initialProducts={products} pageSize={PAGE_SIZE} />
    </div>
  )
}
