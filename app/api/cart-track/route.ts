import { NextResponse } from "next/server"
import { createClient } from "@libsql/client"
import { getCurrentUser } from "@/actions/get-current-user"
import { notify } from "@/lib/notify"

let _db: ReturnType<typeof createClient> | null = null
function db() {
  if (!_db && process.env.TURSO_DATABASE_URL)
    _db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN })
  return _db
}

async function ensureTable() {
  await db()?.execute(`
    CREATE TABLE IF NOT EXISTS AbandonedCart (
      id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
      userId      TEXT NOT NULL UNIQUE,
      userEmail   TEXT NOT NULL,
      userName    TEXT,
      cartData    TEXT NOT NULL,
      itemCount   INTEGER NOT NULL DEFAULT 0,
      totalUSD    REAL NOT NULL DEFAULT 0,
      trackedAt   TEXT NOT NULL DEFAULT (datetime('now')),
      notified    INTEGER NOT NULL DEFAULT 0,
      notifiedAt  TEXT
    )
  `)
}

/** POST — called client-side when a logged-in user has items in cart */
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user?.email) return NextResponse.json({ ok: false })

  const { items } = await req.json()
  if (!Array.isArray(items) || items.length === 0)
    return NextResponse.json({ ok: false })

  const total = items.reduce((s: number, i: any) => s + Number(i.price), 0)
  await ensureTable()

  await db()?.execute({
    sql: `INSERT INTO AbandonedCart (userId, userEmail, userName, cartData, itemCount, totalUSD)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(userId) DO UPDATE SET
            cartData = excluded.cartData,
            itemCount = excluded.itemCount,
            totalUSD = excluded.totalUSD,
            trackedAt = datetime('now'),
            notified = 0`,
    args: [user.id, user.email, `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(), JSON.stringify(items), items.length, total],
  })

  return NextResponse.json({ ok: true })
}

/**
 * GET — admin trigger: find carts abandoned > 1 hour, send notifications.
 * Call from a cron job, Vercel Cron, or manually:
 *   curl https://yoursite.com/api/cart-track?secret=YOUR_CRON_SECRET
 */
export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret")
  if (secret !== process.env.CRON_SECRET && process.env.CRON_SECRET)
    return new Response("Unauthorized", { status: 401 })

  await ensureTable()
  const abandoned = await db()?.execute(`
    SELECT userId, userEmail, userName, cartData, itemCount, totalUSD
    FROM AbandonedCart
    WHERE notified = 0
      AND datetime(trackedAt) < datetime('now', '-1 hour')
  `)

  const rows = abandoned?.rows ?? []
  let sent = 0

  for (const row of rows) {
    const [userId, userEmail, userName, cartData, itemCount, totalUSD] = row
    const items: any[] = JSON.parse(String(cartData))
    const name = String(userName || userEmail)
    const itemList = items.slice(0, 3).map((i: any) => `  • ${i.name} (${i.variantLabel ?? "Paperback"}) — $${Number(i.price).toFixed(2)}`).join("\n")
    const more = items.length > 3 ? `\n  ...and ${items.length - 3} more` : ""

    await notify({
      subject: `🛒 Abandoned Cart — ${name}`,
      body: `${name} added ${itemCount} book(s) to their cart ($${Number(totalUSD).toFixed(2)}) but hasn't checked out.\n\nItems:\n${itemList}${more}\n\nUser email: ${userEmail}`,
      toEmail: process.env.NOTIFY_TO_EMAIL,
    })

    await db()?.execute({
      sql: `UPDATE AbandonedCart SET notified = 1, notifiedAt = datetime('now') WHERE userId = ?`,
      args: [userId],
    })
    sent++
  }

  return NextResponse.json({ checked: rows.length, sent })
}
