import { NextResponse } from "next/server"
import { createClient } from "@libsql/client"
import { deriveStock } from "@/lib/stock"
import { getCurrentUser } from "@/actions/get-current-user"

let _db: ReturnType<typeof createClient> | null = null
function db() {
  if (!_db && process.env.TURSO_DATABASE_URL)
    _db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN })
  return _db
}

async function ensureTable() {
  await db()?.execute(`
    CREATE TABLE IF NOT EXISTS ProductStock (
      productId TEXT PRIMARY KEY,
      stock     INTEGER NOT NULL DEFAULT 99
    )
  `)
}

/** GET /api/stock/[productId] — returns real stock if set, otherwise derived demo value */
export async function GET(_req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params
  await ensureTable()

  const res = await db()?.execute({
    sql: `SELECT stock FROM ProductStock WHERE productId = ?`,
    args: [productId],
  })

  const stock = res?.rows?.[0]?.[0] != null
    ? Number(res.rows[0][0])
    : deriveStock(productId)

  return NextResponse.json({ stock, productId })
}

/** PUT /api/stock/[productId] — admin sets real stock level */
export async function PUT(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const user = await getCurrentUser()
  if (user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { productId } = await params
  const { stock } = await req.json()
  if (typeof stock !== "number" || stock < 0)
    return NextResponse.json({ error: "stock must be a non-negative number" }, { status: 400 })

  await ensureTable()
  await db()?.execute({
    sql: `INSERT INTO ProductStock (productId, stock) VALUES (?, ?)
          ON CONFLICT(productId) DO UPDATE SET stock = excluded.stock`,
    args: [productId, stock],
  })

  return NextResponse.json({ ok: true, productId, stock })
}
