import { NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/get-current-user"
import { createClient } from "@libsql/client"

let _db: ReturnType<typeof createClient> | null = null
function db() {
  if (!_db && process.env.TURSO_DATABASE_URL)
    _db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN })
  return _db
}

export async function ensureLoyaltyTables() {
  const client = db()
  if (!client) return
  await client.execute(`
    CREATE TABLE IF NOT EXISTS LoyaltyPoints (
      userId    TEXT PRIMARY KEY,
      points    INTEGER NOT NULL DEFAULT 0,
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS PointsTransaction (
      id        TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
      userId    TEXT NOT NULL,
      points    INTEGER NOT NULL,
      type      TEXT NOT NULL,
      note      TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ points: 0 })

  try {
    await ensureLoyaltyTables()
    const res = await db()?.execute({ sql: "SELECT points FROM LoyaltyPoints WHERE userId = ?", args: [user.id] })
    const points = Number(res?.rows[0]?.[0] ?? 0)
    return NextResponse.json({ points })
  } catch {
    return NextResponse.json({ points: 0 })
  }
}

// Called server-side after a successful order to credit points
export async function POST(req: Request) {
  try {
    const { userId, orderId, amountUSD } = await req.json()
    if (!userId || !amountUSD) return NextResponse.json({ ok: false }, { status: 400 })

    await ensureLoyaltyTables()
    const earned = Math.floor(amountUSD) // 1 point per $1

    await db()?.batch([
      {
        sql: `INSERT INTO LoyaltyPoints (userId, points) VALUES (?, ?)
              ON CONFLICT(userId) DO UPDATE SET points = points + ?, updatedAt = datetime('now')`,
        args: [userId, earned, earned],
      },
      {
        sql: `INSERT INTO PointsTransaction (userId, points, type, note) VALUES (?, ?, 'earn', ?)`,
        args: [userId, earned, `Order ${orderId ?? "unknown"}`],
      },
    ])

    const res = await db()?.execute({ sql: "SELECT points FROM LoyaltyPoints WHERE userId = ?", args: [userId] })
    return NextResponse.json({ ok: true, earned, total: Number(res?.rows[0]?.[0] ?? earned) })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
