import { NextResponse } from "next/server"
import { createClient } from "@libsql/client"
import { getCurrentUser } from "@/actions/get-current-user"

let _db: ReturnType<typeof createClient> | null = null
function db() {
  if (!_db && process.env.TURSO_DATABASE_URL)
    _db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN })
  return _db
}

async function ensureTable() {
  await db()?.execute(`
    CREATE TABLE IF NOT EXISTS BundleRule (
      id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
      minQty     INTEGER NOT NULL,
      discount   REAL NOT NULL,
      label      TEXT NOT NULL,
      active     INTEGER NOT NULL DEFAULT 1,
      createdAt  TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  const count = await db()?.execute("SELECT COUNT(*) FROM BundleRule")
  if (Number(count?.rows[0][0]) === 0) {
    await db()?.batch([
      { sql: "INSERT INTO BundleRule (minQty,discount,label) VALUES (?,?,?)", args: [3,  10, "Buy 3, get 10% off"]  },
      { sql: "INSERT INTO BundleRule (minQty,discount,label) VALUES (?,?,?)", args: [5,  15, "Buy 5, get 15% off"]  },
      { sql: "INSERT INTO BundleRule (minQty,discount,label) VALUES (?,?,?)", args: [10, 20, "Buy 10, get 20% off"] },
    ])
  }
}

/** GET /api/bundles — returns all active rules, sorted by minQty asc */
export async function GET() {
  await ensureTable()
  const res = await db()?.execute(
    `SELECT id, minQty, discount, label, active FROM BundleRule WHERE active = 1 ORDER BY minQty ASC`
  )
  const rules = (res?.rows ?? []).map(r => ({
    id: String(r[0]), minQty: Number(r[1]), discount: Number(r[2]),
    label: String(r[3]), active: Number(r[4]) === 1,
  }))
  return NextResponse.json({ rules })
}

/** POST /api/bundles — admin: create rule { minQty, discount, label } */
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { minQty, discount, label } = await req.json()
  if (!minQty || !discount || !label)
    return NextResponse.json({ error: "minQty, discount, label required" }, { status: 400 })

  await ensureTable()
  await db()?.execute({
    sql: `INSERT INTO BundleRule (minQty, discount, label) VALUES (?, ?, ?)`,
    args: [minQty, discount, label],
  })
  return NextResponse.json({ ok: true })
}

/** PATCH /api/bundles — admin: toggle active { id, active } */
export async function PATCH(req: Request) {
  const user = await getCurrentUser()
  if (user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, active } = await req.json()
  await db()?.execute({ sql: `UPDATE BundleRule SET active = ? WHERE id = ?`, args: [active ? 1 : 0, id] })
  return NextResponse.json({ ok: true })
}
