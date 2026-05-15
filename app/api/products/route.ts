import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import { createClient, type Client } from "@libsql/client"

let _db: Client | null = null
function getLibsql(): Client | null {
  if (!process.env.TURSO_DATABASE_URL) return null
  if (!_db) _db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN })
  return _db
}

export async function GET(req: Request) {
  const db = getLibsql()
  try {
    const { searchParams } = new URL(req.url)

    const categoryIdParam = searchParams.get("categoryId")
    const categoryIdsParam = searchParams.get("categoryIds")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const q = searchParams.get("q")?.trim()
    const tagsParam = searchParams.get("tags")
    const tagIds = tagsParam ? tagsParam.split(",").filter(Boolean) : []

    let categoryFilter: object = {}
    if (categoryIdsParam) {
      const ids = categoryIdsParam.split(",").filter(Boolean)
      categoryFilter = ids.length === 1 ? { categoryId: ids[0] } : { categoryId: { in: ids } }
    } else if (categoryIdParam) {
      categoryFilter = { categoryId: categoryIdParam }
    }

    const priceFilter =
      minPrice || maxPrice
        ? { price: { ...(minPrice ? { gte: parseFloat(minPrice) } : {}), ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}) } }
        : {}

    // Tag filtering via raw SQL (works without prisma generate)
    let tagProductIds: string[] | null = null
    if (db && tagIds.length > 0) {
      const placeholders = tagIds.map(() => "?").join(",")
      const tagRes = await db.execute({
        sql: `SELECT DISTINCT productId FROM ProductTag WHERE tagId IN (${placeholders})`,
        args: tagIds,
      })
      tagProductIds = tagRes.rows.map(r => String(r[0]))
    }

    const where: any = {
      isArchived: false,
      ...categoryFilter,
      ...priceFilter,
      ...(q ? { name: { contains: q } } : {}),
      ...(tagProductIds !== null ? { id: { in: tagProductIds } } : {}),
    }

    if (searchParams.get("count") === "true") {
      const count = await prismadb.product.count({ where })
      return NextResponse.json({ count })
    }

    const skip = parseInt(searchParams.get("skip") ?? "0")
    const take = parseInt(searchParams.get("take") ?? "20")

    const products = await prismadb.product.findMany({
      where,
      include: { category: true, size: true, images: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    })

    // Attach tags via raw libsql (works without prisma generate)
    if (db && products.length > 0) {
      const ids = products.map(p => p.id)
      const placeholders = ids.map(() => "?").join(",")
      const tagRes = await db.execute({
        sql: `SELECT pt.productId, t.id, t.name, t.slug, t.color, t."group"
              FROM ProductTag pt JOIN Tag t ON t.id = pt.tagId
              WHERE pt.productId IN (${placeholders})`,
        args: ids,
      })
      const tagMap = new Map<string, { tag: { id: string; name: string; slug: string; color: string; group: string } }[]>()
      for (const r of tagRes.rows) {
        const pid = String(r[0])
        if (!tagMap.has(pid)) tagMap.set(pid, [])
        tagMap.get(pid)!.push({ tag: { id: String(r[1]), name: String(r[2]), slug: String(r[3]), color: String(r[4]), group: String(r[5]) } })
      }
      const productsWithTags = products.map(p => ({ ...p, tags: tagMap.get(p.id) ?? [] }))
      return NextResponse.json(productsWithTags)
    }

    return NextResponse.json(products)
  } catch (e) {
    console.error(e)
    return new NextResponse("Internal error", { status: 500 })
  }
}
