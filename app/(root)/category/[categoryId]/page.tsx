import { cache } from "react";
import NoResults from "@/components/ui/no-results";
import ProductGrid from "@/components/product-grid";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CategorySidebar } from "@/components/category-sidebar";
import prismadb from "@/lib/prismadb";
import type { Metadata } from "next";

const PAGE_SIZE = 20
const SIDEBAR_THRESHOLD = 5

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
  return {
    title: category?.name ?? "Category",
    description: `Browse all ${category?.name ?? "products"} in our store.`,
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

  // effective product category IDs:
  // if this category has leaf children → include children's products too (group page)
  // otherwise just own ID (leaf page)
  const childIds = category.children.map(c => c.id)
  const effectiveIds = childIds.length > 0 ? [categoryId, ...childIds] : [categoryId]

  const productWhere = {
    isArchived: false,
    categoryId: { in: effectiveIds },
    images: { some: { url: { startsWith: "http" } } },
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

  // subcategory filter options: only leaf children (those that hold products)
  const subcategories = childIds.length > 0
    ? category.children.map(c => ({ id: c.id, name: c.name }))
    : []

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <div className={showSidebar ? "flex gap-8" : ""}>
        {showSidebar && root && (
          <CategorySidebar root={root as any} activeId={category.id} />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-slate-700 mb-4">{category.name}</h1>
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
  )
}

export default CategoryPage;
