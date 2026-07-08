import Script from "next/script"

export const revalidate = 300 // cache at CDN for 5 minutes
import NoResults from "@/components/ui/no-results"
import ProductGrid from "@/components/product-grid"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { CategorySidebar } from "@/components/category-sidebar"
import type { Metadata } from "next"
import { getCategory, getCategoryPageData, PAGE_SIZE } from "./get-category-page-data"
import { buildBreadcrumbJsonLd, buildItemListJsonLd } from "./json-ld"

const BASE_URL = process.env.NEXT_APP_URL || "https://library-git-main-devlevelcodings-projects.vercel.app"

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

  const { root, products, totalCount, effectiveIds, availableTags, showSidebar, breadcrumbItems, minPrice, maxPrice, subcategories } =
    await getCategoryPageData(categoryId, category)

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(BASE_URL, categoryId, breadcrumbItems)
  const itemListJsonLd = buildItemListJsonLd(BASE_URL, category.name, totalCount, products)

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
              initialProducts={products as any}
              categoryIds={effectiveIds}
              pageSize={PAGE_SIZE}
              initialTotal={totalCount}
              absoluteMinPrice={minPrice}
              absoluteMaxPrice={maxPrice}
              subcategories={subcategories}
              availableTags={availableTags}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default CategoryPage
