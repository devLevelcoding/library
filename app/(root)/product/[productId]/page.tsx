import React from "react";
import Gallery from "@/components/gallery/index";
import Info from "@/components/info";
import prismadb from "@/lib/prismadb";
import ProductCard from "@/components/product-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { productId: string } }): Promise<Metadata> {
  const product = await prismadb.product.findUnique({
    where: { id: params.productId },
    include: { images: true, category: true },
  })
  return {
    title: product?.name ?? "Product",
    description: `${product?.name} — ${product?.category?.name}`,
    openGraph: {
      images: product?.images?.[0]?.url ? [product.images[0].url] : [],
    },
  }
}

const ProductPage = async ({ params }: { params: { productId: string } }) => {
  const product = await prismadb.product.findUnique({
    where: { id: params.productId },
    include: {
      images: true,
      size: true,
      category: { include: { parent: true } },
    },
  })

  if (!product) return null

  const suggestedProducts = await prismadb.product.findMany({
    where: { categoryId: product.categoryId, NOT: { id: product.id }, isArchived: false },
    include: { images: true, size: true, category: true },
    take: 8,
  })

  const breadcrumbItems = [
    ...(product.category.parent
      ? [{ label: product.category.parent.name, href: `/category/${product.category.parent.id}` }]
      : []),
    { label: product.category.name, href: `/category/${product.category.id}` },
    { label: product.name },
  ]

  return (
    <div className="bg-white">
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbItems} />
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          <Gallery images={product.images} />
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            {/* @ts-ignore */}
            <Info data={product} />
          </div>
        </div>
        <hr className="my-10" />
      </div>

      {suggestedProducts.length > 0 && (
        <div className="my-2 font-semibold text-lg">
          <h2>You might also like</h2>
        </div>
      )}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-10">
        {suggestedProducts.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}

export default ProductPage;
