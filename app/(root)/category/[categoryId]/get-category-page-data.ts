import { cache } from "react"
import prismadb from "@/lib/prismadb"

export const PAGE_SIZE = 20
export const SIDEBAR_THRESHOLD = 5

export const getCategory = cache(async (categoryId: string) => {
  return prismadb.category.findUnique({
    where: { id: categoryId },
    include: {
      parent: { include: { parent: true } },
      children: { where: { enabled: true }, orderBy: { name: "asc" } },
    },
  })
})

type TagRow = { id: string; name: string; slug: string; color: string; group: string }

async function getAvailableTags(): Promise<TagRow[]> {
  if (!process.env.TURSO_DATABASE_URL) return []
  try {
    const { createClient } = await import("@libsql/client")
    const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN })
    const res = await db.execute('SELECT id, name, slug, color, "group" FROM Tag ORDER BY "group" ASC, name ASC')
    const tags = res.rows.map(r => ({
      id: String(r[0]), name: String(r[1]), slug: String(r[2]), color: String(r[3]), group: String(r[4]),
    }))
    db.close()
    return tags
  } catch {
    return []
  }
}

export async function getCategoryPageData(categoryId: string, category: NonNullable<Awaited<ReturnType<typeof getCategory>>>) {
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

  const [root, products, totalCount, priceRange, availableTags] = await Promise.all([
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
    getAvailableTags(),
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

  return {
    root, products, totalCount, effectiveIds, availableTags,
    showSidebar, breadcrumbItems, minPrice, maxPrice, subcategories,
  }
}
