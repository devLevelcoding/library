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
    CREATE TABLE IF NOT EXISTS GiftCard (
      code    TEXT PRIMARY KEY,
      amount  REAL NOT NULL,
      used    INTEGER NOT NULL DEFAULT 0,
      usedBy  TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  // Seed demo cards if table is empty
  const count = await db()?.execute("SELECT COUNT(*) as n FROM GiftCard")
  if (Number(count?.rows[0][0]) === 0) {
    await db()?.batch([
      { sql: "INSERT OR IGNORE INTO GiftCard (code, amount) VALUES (?,?)", args: ["BOOK10", 10] },
      { sql: "INSERT OR IGNORE INTO GiftCard (code, amount) VALUES (?,?)", args: ["BOOK25", 25] },
      { sql: "INSERT OR IGNORE INTO GiftCard (code, amount) VALUES (?,?)", args: ["WELCOME5", 5] },
    ])
  }
}

export async function POST(req: Request) {
  try {
    const { code } = await req.json()
    if (!code?.trim()) return NextResponse.json({ valid: false, error: "No code provided" }, { status: 400 })

    await ensureTable()
    const result = await db()?.execute({ sql: "SELECT amount, used FROM GiftCard WHERE code = ?", args: [code.trim().toUpperCase()] })
    const row = result?.rows[0]

    if (!row) return NextResponse.json({ valid: false, error: "Invalid gift card code" })
    if (Number(row[1]) === 1) return NextResponse.json({ valid: false, error: "This gift card has already been used" })

    return NextResponse.json({ valid: true, amount: Number(row[0]), code: code.trim().toUpperCase() })
  } catch (e: any) {
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 })
  }
}
