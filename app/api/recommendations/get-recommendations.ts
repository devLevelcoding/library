import { createClient, type Client } from "@libsql/client"
import prismadb from "@/lib/prismadb"

let _db: Client | null = null
function db(): Client | null {
  if (!process.env.TURSO_DATABASE_URL) return null
  if (!_db) _db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN })
  return _db
}

/**
 * Scoring (higher = better):
 *   +2 per shared tag
 *   +1 for same category
 * Returns products sorted by score desc, excluding the source product.
 */
export async function getRecommendations(productId: string, limit: number) {
  const source = await prismadb.product.findUnique({
    where: { id: productId },
    select: { categoryId: true },
  })
  if (!source) return []

  let tagIds: string[] = []
  const client = db()
  if (client) {
    const tagRes = await client.execute({
      sql: `SELECT tagId FROM ProductTag WHERE productId = ?`,
      args: [productId],
    })
    tagIds = tagRes.rows.map(r => String(r[0]))
  }

  // Score candidates with raw SQL (tag overlap × 2 + category match × 1)
  let scoredIds: string[] = []
  if (client && tagIds.length > 0) {
    const placeholders = tagIds.map(() => "?").join(",")
    const res = await client.execute({
      sql: `
        SELECT pt.productId,
               COUNT(*) * 2 AS tagScore
        FROM ProductTag pt
        WHERE pt.tagId IN (${placeholders})
          AND pt.productId != ?
        GROUP BY pt.productId
        ORDER BY tagScore DESC
        LIMIT ?
      `,
      args: [...tagIds, productId, limit * 3],
    })
    scoredIds = res.rows.map(r => String(r[0]))
  }

  // Fill remainder with same-category products if we don't have enough tag matches
  const tagSet = new Set(scoredIds)

  const categoryProducts = await prismadb.product.findMany({
    where: {
      categoryId: source.categoryId,
      isArchived: false,
      NOT: { id: productId },
      ...(scoredIds.length > 0 ? { id: { notIn: scoredIds } } : {}),
    },
    select: { id: true },
    take: limit,
  })
  const categoryIds = categoryProducts.map(p => p.id)

  // Merge: tag-scored first (capped to `limit`), then category fill
  const finalIds = [...scoredIds.slice(0, limit), ...categoryIds].slice(0, limit)

  if (finalIds.length === 0) return []

  const products = await prismadb.product.findMany({
    where: { id: { in: finalIds }, isArchived: false },
    include: { images: true, size: true, category: true },
  })

  // Re-sort to preserve score order (Prisma doesn't guarantee IN order)
  const indexMap = new Map(finalIds.map((id, i) => [id, i]))
  products.sort((a, b) => (indexMap.get(a.id) ?? 99) - (indexMap.get(b.id) ?? 99))

  // Attach shared tag count as relevance hint for the UI
  return products.map(p => ({
    ...p,
    sharedTags: tagSet.has(p.id),
  }))
}
