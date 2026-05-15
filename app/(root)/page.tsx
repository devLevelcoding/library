import Billboard from "@/components/ui/billboard";
import NoResults from "@/components/ui/no-results";
import ProductCard from "@/components/product-card";
import prismadb from "@/lib/prismadb";
import type { Metadata } from "next";
import type { Category, Image, Product, Size } from "@prisma/client";

type FullProduct = Product & { images: Image[]; category: Category; size: Size }

export const revalidate = 300

export const metadata: Metadata = {
  title: "Home",
  description: "Browse thousands of books across fiction, mystery, romance and more.",
}

export default async function Home() {
  let setting = null
  let products: FullProduct[] = []

  try {
    setting = await prismadb.setting.findFirst()
    products = await prismadb.product.findMany({
      where: { isArchived: false },
      include: { category: true, size: true, images: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    })
  } catch {
    // DB not available at build time
  }

  return (
    <div>
      {setting && <Billboard imageUrl={setting.billboardImageUrl} title={setting.billboardTitle} />}
      {products.length === 0 && <NoResults />}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-6">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < 4} />
        ))}
      </div>
    </div>
  )
}
