import { NextResponse } from "next/server"
import { createClient } from "@libsql/client"
import { notify } from "@/lib/notify"

let _db: ReturnType<typeof createClient> | null = null
function db() {
  if (!_db && process.env.TURSO_DATABASE_URL)
    _db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN })
  return _db
}

const BASE_URL = process.env.NEXT_APP_URL ?? "https://library-git-main-devlevelcodings-projects.vercel.app"

/**
 * POST /api/stock-alerts/notify/[productId]
 * Admin trigger — sends alerts to all subscribers for this product.
 * Body: { secret?: string }
 */
export async function POST(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params
  const body = await req.json().catch(() => ({}))

  if (body.secret !== process.env.CRON_SECRET && process.env.CRON_SECRET)
    return new Response("Unauthorized", { status: 401 })

  const subscribers = await db()?.execute({
    sql: `SELECT id, email, productName FROM StockAlert WHERE productId = ? AND notified = 0`,
    args: [productId],
  })

  const rows = subscribers?.rows ?? []
  if (rows.length === 0) return NextResponse.json({ sent: 0 })

  const productName = String(rows[0][2])
  const productUrl  = `${BASE_URL}/product/${productId}`
  let sent = 0

  for (const row of rows) {
    const [id, email] = row
    await notify({
      subject: `📦 "${productName}" is back in stock!`,
      body: `Good news! The book you wanted is available again.\n\n"${productName}"\n\nBuy now: ${productUrl}`,
      html: `<p>Good news! <strong>${productName}</strong> is back in stock.</p><p><a href="${productUrl}">Click here to buy now →</a></p>`,
      toEmail: String(email),
    })

    await db()?.execute({
      sql: `UPDATE StockAlert SET notified = 1 WHERE id = ?`,
      args: [id],
    })
    sent++
  }

  // Also ping the admin channel with a summary
  await notify({
    subject: `📦 Stock alert sent — "${productName}"`,
    body: `Notified ${sent} subscriber(s) that "${productName}" is back in stock.`,
  })

  return NextResponse.json({ sent, product: productName })
}
