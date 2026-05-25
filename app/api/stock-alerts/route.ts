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
    CREATE TABLE IF NOT EXISTS StockAlert (
      id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
      email       TEXT NOT NULL,
      productId   TEXT NOT NULL,
      productName TEXT NOT NULL,
      notified    INTEGER NOT NULL DEFAULT 0,
      createdAt   TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(email, productId)
    )
  `)
}

/** POST — user subscribes to back-in-stock alert */
export async function POST(req: Request) {
  const { email, productId, productName } = await req.json()
  if (!email?.trim() || !productId) return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 })

  await ensureTable()
  await db()?.execute({
    sql: `INSERT OR IGNORE INTO StockAlert (email, productId, productName) VALUES (?, ?, ?)`,
    args: [email.trim().toLowerCase(), productId, productName ?? "Book"],
  })

  return NextResponse.json({ ok: true })
}

/** GET — admin: list all pending alerts */
export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret")
  if (secret !== process.env.CRON_SECRET && process.env.CRON_SECRET)
    return new Response("Unauthorized", { status: 401 })

  await ensureTable()
  const res = await db()?.execute(`SELECT * FROM StockAlert WHERE notified = 0 ORDER BY createdAt DESC`)
  return NextResponse.json(res?.rows ?? [])
}
