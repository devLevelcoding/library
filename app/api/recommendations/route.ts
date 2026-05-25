import { NextResponse } from "next/server"
import { createClient, type Client } from "@libsql/client"
import prismadb from "@/lib/prismadb"

let _db: Client | null = null
function db(): Client | null {
  if (!process.env.TURSO_DATABASE_URL) return null
  if (!_db) _db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN })
  return _db
}

/**
 * GET /api/recommendations?productId=X&limit=8
 *
 * Scoring (higher = better):
 *   +2 per shared tag
 *   +1 for same category
 * Returns products sorted by score desc, excluding the source product.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get("productId")
  const limit = Math.min(Number(searchParams.get("limit") ?? "8"), 20)

  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 })

  // 1. Fetch source product's tags and categoryId
  const source = await prismadb.product.findUnique({
    where: { id: productId },
    select: { categoryId: true },
  })
  if (!source) return NextResponse.json({ items: [] })

  let tagIds: string[] = []
  const client = db()
  if (client) {
    const tagRes = await client.execute({
      sql: `SELECT tagId FROM ProductTag WHERE productId = ?`,
      args: [productId],
    })
    tagIds = tagRes.rows.map(r => String(r[0]))
  }

  // 2. Score candidates with raw SQL (tag overlap × 2 + category match × 1)
  let scoredIds: string[] = []
  if (client && tagIds.length > 0) {
    const placeholders = tagIds.map(() => "?").join(",")
    // Count shared tags per candidate product, add category bonus via subquery
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

  // 3. Fill remainder with same-category products if we don't have enough tag matches
  const needed = limit
  const tagSet = new Set(scoredIds)

  const categoryProducts = await prismadb.product.findMany({
    where: {
      categoryId: source.categoryId,
      isArchived: false,
      NOT: { id: productId },
      ...(scoredIds.length > 0 ? { id: { notIn: scoredIds } } : {}),
    },
    select: { id: true },
    take: needed,
  })
  const categoryIds = categoryProducts.map(p => p.id)

  // Merge: tag-scored first (capped to `needed`), then category fill
  const finalIds = [...scoredIds.slice(0, needed), ...categoryIds].slice(0, needed)

  if (finalIds.length === 0) return NextResponse.json({ items: [] })

  // 4. Fetch full product data
  const products = await prismadb.product.findMany({
    where: { id: { in: finalIds }, isArchived: false },
    include: { images: true, size: true, category: true },
  })

  // Re-sort to preserve score order (Prisma doesn't guarantee IN order)
  const indexMap = new Map(finalIds.map((id, i) => [id, i]))
  products.sort((a, b) => (indexMap.get(a.id) ?? 99) - (indexMap.get(b.id) ?? 99))

  // Attach shared tag count as relevance hint for the UI
  const withScore = products.map(p => ({
    ...p,
    sharedTags: tagSet.has(p.id)
      ? (scoredIds.indexOf(p.id) < scoredIds.length ? true : false)
      : false,
  }))

  return NextResponse.json({ items: withScore })
}
