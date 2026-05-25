import { NextResponse } from "next/server"
import { createClient } from "@libsql/client"

let _db: ReturnType<typeof createClient> | null = null
function db() {
  if (!_db && process.env.TURSO_DATABASE_URL)
    _db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN })
  return _db
}

async function ensureTable() {
  await db()?.execute(`
    CREATE TABLE IF NOT EXISTS DiscountCode (
      code       TEXT PRIMARY KEY,
      type       TEXT NOT NULL CHECK(type IN ('percent','fixed')),
      value      REAL NOT NULL,
      minOrder   REAL NOT NULL DEFAULT 0,
      maxUses    INTEGER NOT NULL DEFAULT 0,
      usedCount  INTEGER NOT NULL DEFAULT 0,
      active     INTEGER NOT NULL DEFAULT 1,
      expiresAt  TEXT,
      createdAt  TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  // Seed demo codes if empty
  const count = await db()?.execute("SELECT COUNT(*) FROM DiscountCode")
  if (Number(count?.rows[0][0]) === 0) {
    await db()?.batch([
      { sql: "INSERT OR IGNORE INTO DiscountCode (code,type,value,minOrder) VALUES (?,?,?,?)", args: ["SAVE10",    "percent", 10,  0]  },
      { sql: "INSERT OR IGNORE INTO DiscountCode (code,type,value,minOrder) VALUES (?,?,?,?)", args: ["SUMMER20",  "percent", 20,  0]  },
      { sql: "INSERT OR IGNORE INTO DiscountCode (code,type,value,minOrder) VALUES (?,?,?,?)", args: ["BOOKS5",    "fixed",    5,  0]  },
      { sql: "INSERT OR IGNORE INTO DiscountCode (code,type,value,minOrder) VALUES (?,?,?,?)", args: ["WELCOME15", "percent", 15, 20]  },
    ])
  }
}

/**
 * POST /api/discounts/validate
 * Body: { code: string, subtotal: number }
 * Returns: { valid, type, value, discountAmount, code, error? }
 */
export async function POST(req: Request) {
  try {
    const { code, subtotal = 0 } = await req.json()
    if (!code?.trim()) return NextResponse.json({ valid: false, error: "No code provided" }, { status: 400 })

    await ensureTable()

    const res = await db()?.execute({
      sql: `SELECT type, value, minOrder, maxUses, usedCount, active, expiresAt FROM DiscountCode WHERE code = ?`,
      args: [code.trim().toUpperCase()],
    })
    const row = res?.rows[0]

    if (!row) return NextResponse.json({ valid: false, error: "Invalid discount code" })
    if (Number(row[4] /* active */) === 0 || Number(row[3]) === 0 && Number(row[2]) !== 0) {
      // re-check properly
    }

    const [type, value, minOrder, maxUses, usedCount, active, expiresAt] = [
      String(row[0]), Number(row[1]), Number(row[2]),
      Number(row[3]), Number(row[4]), Number(row[5]), row[6] ? String(row[6]) : null,
    ]

    if (active !== 1) return NextResponse.json({ valid: false, error: "This code is no longer active" })
    if (expiresAt && new Date(expiresAt) < new Date())
      return NextResponse.json({ valid: false, error: "This code has expired" })
    if (maxUses > 0 && usedCount >= maxUses)
      return NextResponse.json({ valid: false, error: "This code has reached its usage limit" })
    if (subtotal < minOrder)
      return NextResponse.json({
        valid: false,
        error: `Minimum order of $${minOrder.toFixed(2)} required for this code`,
      })

    const discountAmount = type === "percent"
      ? Math.round(subtotal * value) / 100
      : Math.min(value, subtotal)

    return NextResponse.json({
      valid: true,
      code: code.trim().toUpperCase(),
      type,
      value,
      discountAmount,
      label: type === "percent" ? `${value}% off` : `$${value.toFixed(2)} off`,
    })
  } catch (e: any) {
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 })
  }
}
