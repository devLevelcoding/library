import Billboard from "@/components/ui/billboard";
import NoResults from "@/components/ui/no-results";
import ProductGrid from "@/components/product-grid";
import prismadb from "@/lib/prismadb";
import type { Metadata } from "next";
import type { Category, Image, Product, Size } from "@prisma/client";

type FullProduct = Product & { images: Image[]; category: Category; size: Size }

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Home",
  description: "Browse thousands of products across beauty, electronics, fashion and more.",
}

const PAGE_SIZE = 20

export default async function Home() {
  let setting = null
  let products: FullProduct[] = []

  try {
    setting = await prismadb.setting.findFirst()
    products = await prismadb.product.findMany({
      where: { isArchived: false, images: { some: { url: { startsWith: "http" } } } },
      include: { category: true, size: true, images: true },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
    })
  } catch {
    // DB not available at build time
  }

  return (
    <div>
      {setting && <Billboard imageUrl={setting.billboardImageUrl} title={setting.billboardTitle} />}
      {products.length === 0 && <NoResults />}
      <ProductGrid initialProducts={products} pageSize={PAGE_SIZE} />
    </div>
  )
}
