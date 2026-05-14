import { cache } from "react"
import Script from "next/script"

export const revalidate = 300 // cache at CDN for 5 minutes
import NoResults from "@/components/ui/no-results"
import ProductGrid from "@/components/product-grid"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { CategorySidebar } from "@/components/category-sidebar"
import prismadb from "@/lib/prismadb"
import type { Metadata } from "next"

const PAGE_SIZE = 20
const SIDEBAR_THRESHOLD = 5

const BASE_URL = process.env.NEXT_APP_URL || "https://library-git-main-devlevelcodings-projects.vercel.app"

const getCategory = cache(async (categoryId: string) => {
  return prismadb.category.findUnique({
    where: { id: categoryId },
    include: {
      parent: { include: { parent: true } },
      children: { where: { enabled: true }, orderBy: { name: "asc" } },
    },
  })
})

export async function generateMetadata({ params }: { params: Promise<{ categoryId: string }> }): Promise<Metadata> {
  const { categoryId } = await params
  const category = await getCategory(categoryId)
  const name = category?.name ?? "Category"
  return {
    title: name,
    description: `Shop ${name} — browse the best prices on ${name.toLowerCase()} products online.`,
    alternates: { canonical: `${BASE_URL}/category/${categoryId}` },
    openGraph: {
      title: `${name} | Shop`,
      description: `Shop ${name} — browse the best prices on ${name.toLowerCase()} products online.`,
      url: `${BASE_URL}/category/${categoryId}`,
      type: "website",
    },
  }
}

const CategoryPage = async ({ params }: { params: Promise<{ categoryId: string }> }) => {
  const { categoryId } = await params
  const category = await getCategory(categoryId)
  if (!category) return null

  const rootId =
    category.parent?.parent?.id ??
    category.parent?.id ??
    category.id

  const childIds = category.children.map(c => c.id)
  const effectiveIds = childIds.length > 0 ? [categoryId, ...childIds] : [categoryId]

  const productWhere = {
    isArchived: false,
    categoryId: { in: effectiveIds },
  }

  const [root, products, totalCount, priceRange] = await Promise.all([
    prismadb.category.findUnique({
      where: { id: rootId },
      include: {
        children: {
          where: { enabled: true },
          orderBy: { name: "asc" },
          include: { children: { where: { enabled: true }, orderBy: { name: "asc" } } },
        },
      },
    }),
    prismadb.product.findMany({
      where: productWhere,
      include: { category: true, size: true, images: true },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
    }),
    prismadb.product.count({ where: productWhere }),
    prismadb.product.aggregate({
      where: productWhere,
      _min: { price: true },
      _max: { price: true },
    }),
  ])

  const showSidebar = root != null && root.children.length > SIDEBAR_THRESHOLD

  const breadcrumbItems = [
    ...(category.parent?.parent
      ? [{ label: category.parent.parent.name, href: `/category/${category.parent.parent.id}` }]
      : []),
    ...(category.parent
      ? [{ label: category.parent.name, href: `/category/${category.parent.id}` }]
      : []),
    { label: category.name },
  ]

  const minPrice = Number(priceRange._min.price ?? 0)
  const maxPrice = Number(priceRange._max.price ?? 9999)

  const subcategories = childIds.length > 0
    ? category.children.map(c => ({ id: c.id, name: c.name }))
    : []

  // JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      ...breadcrumbItems.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.label,
        ...(item.href ? { item: `${BASE_URL}${item.href}` } : { item: `${BASE_URL}/category/${categoryId}` }),
      })),
    ],
  }

  // JSON-LD: ItemList for top products
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    description: `Browse ${totalCount} ${category.name} products`,
    numberOfItems: totalCount,
    itemListElement: products.slice(0, 10).map((product, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: product.name,
        image: product.images[0]?.url ?? undefined,
        url: `${BASE_URL}/product/${product.id}`,
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  }

  return (
    <>
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="itemlist-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <div className={showSidebar ? "flex gap-8" : ""}>
          {showSidebar && root && (
            <CategorySidebar root={root as any} activeId={category.id} />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-slate-700 mb-1">{category.name}</h1>
            <p className="text-sm text-muted-foreground mb-4">{totalCount} products</p>
            {products.length === 0 && <NoResults />}
            <ProductGrid
              initialProducts={products}
              categoryIds={effectiveIds}
              pageSize={PAGE_SIZE}
              initialTotal={totalCount}
              absoluteMinPrice={minPrice}
              absoluteMaxPrice={maxPrice}
              subcategories={subcategories}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default CategoryPage
