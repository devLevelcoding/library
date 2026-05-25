import { NextResponse } from "next/server"
import { createClient } from "@libsql/client"
import { getCurrentUser } from "@/actions/get-current-user"

let _db: ReturnType<typeof createClient> | null = null
function db() {
  if (!_db && process.env.TURSO_DATABASE_URL)
    _db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN })
  return _db
}

/** GET /api/discounts — list all codes (admin only) */
export async function GET() {
  const user = await getCurrentUser()
  if (user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const res = await db()?.execute(
    `SELECT code, type, value, minOrder, maxUses, usedCount, active, expiresAt, createdAt FROM DiscountCode ORDER BY createdAt DESC`
  )
  const codes = (res?.rows ?? []).map(r => ({
    code: String(r[0]), type: String(r[1]), value: Number(r[2]),
    minOrder: Number(r[3]), maxUses: Number(r[4]), usedCount: Number(r[5]),
    active: Number(r[6]) === 1, expiresAt: r[7] ? String(r[7]) : null, createdAt: String(r[8]),
  }))
  return NextResponse.json({ codes })
}

/**
 * POST /api/discounts — create a new discount code (admin only)
 * Body: { code, type: "percent"|"fixed", value, minOrder?, maxUses?, expiresAt? }
 */
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { code, type, value, minOrder = 0, maxUses = 0, expiresAt } = await req.json()
  if (!code?.trim()) return NextResponse.json({ error: "code required" }, { status: 400 })
  if (!["percent", "fixed"].includes(type)) return NextResponse.json({ error: "type must be percent or fixed" }, { status: 400 })
  if (typeof value !== "number" || value <= 0) return NextResponse.json({ error: "value must be > 0" }, { status: 400 })
  if (type === "percent" && value > 100) return NextResponse.json({ error: "percent value must be ≤ 100" }, { status: 400 })

  try {
    await db()?.execute({
      sql: `INSERT INTO DiscountCode (code, type, value, minOrder, maxUses, expiresAt) VALUES (?,?,?,?,?,?)`,
      args: [code.trim().toUpperCase(), type, value, minOrder, maxUses, expiresAt ?? null],
    })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e.message?.includes("UNIQUE")) return NextResponse.json({ error: "Code already exists" }, { status: 409 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

/** PATCH /api/discounts — toggle active / deactivate a code (admin only) */
export async function PATCH(req: Request) {
  const user = await getCurrentUser()
  if (user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { code, active } = await req.json()
  await db()?.execute({ sql: `UPDATE DiscountCode SET active = ? WHERE code = ?`, args: [active ? 1 : 0, code] })
  return NextResponse.json({ ok: true })
}
