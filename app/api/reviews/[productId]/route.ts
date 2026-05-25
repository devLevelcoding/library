import { NextResponse } from "next/server"
import { createClient } from "@libsql/client"
import { getCurrentUser } from "@/actions/get-current-user"
import prismadb from "@/lib/prismadb"

let _db: ReturnType<typeof createClient> | null = null
function db() {
  if (!_db && process.env.TURSO_DATABASE_URL)
    _db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN })
  return _db
}

async function ensureTable() {
  await db()?.execute(`
    CREATE TABLE IF NOT EXISTS Review (
      id        TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
      productId TEXT NOT NULL,
      userId    TEXT NOT NULL,
      userName  TEXT NOT NULL,
      rating    INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      title     TEXT DEFAULT '',
      body      TEXT NOT NULL,
      verified  INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(productId, userId)
    )
  `)
  await db()?.execute(`CREATE INDEX IF NOT EXISTS idx_review_product ON Review(productId)`)
}

/** GET /api/reviews/[productId] — fetch all reviews + summary */
export async function GET(_req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params
  await ensureTable()

  const res = await db()?.execute({
    sql: `SELECT id, userId, userName, rating, title, body, verified, createdAt
          FROM Review WHERE productId = ? ORDER BY createdAt DESC`,
    args: [productId],
  })

  const reviews = (res?.rows ?? []).map(r => ({
    id: String(r[0]),
    userId: String(r[1]),
    userName: String(r[2]),
    rating: Number(r[3]),
    title: String(r[4] ?? ""),
    body: String(r[5]),
    verified: Number(r[6]) === 1,
    createdAt: String(r[7]),
  }))

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }))

  return NextResponse.json({ reviews, avg: Math.round(avg * 10) / 10, total: reviews.length, distribution })
}

/** POST /api/reviews/[productId] — submit a review */
export async function POST(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Sign in to leave a review" }, { status: 401 })

  const { rating, title, body } = await req.json()
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: "Rating 1–5 required" }, { status: 400 })
  if (!body?.trim()) return NextResponse.json({ error: "Review text required" }, { status: 400 })

  await ensureTable()

  // Check verified buyer via Prisma (OrderItem table)
  let verified = false
  try {
    const order = await prismadb.orderItem.findFirst({
      where: { productId, order: { userId: user.id, isPaid: true } },
    })
    verified = !!order
  } catch { /* prisma may not have the model, skip */ }

  const userName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.email?.split("@")[0] || "Reader"

  try {
    await db()?.execute({
      sql: `INSERT INTO Review (productId, userId, userName, rating, title, body, verified)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(productId, userId) DO UPDATE SET
              rating = excluded.rating, title = excluded.title,
              body = excluded.body, createdAt = datetime('now')`,
      args: [productId, user.id, userName, rating, title?.trim() ?? "", body.trim(), verified ? 1 : 0],
    })
    return NextResponse.json({ ok: true, verified })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
