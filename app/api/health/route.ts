import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET() {
  const dbUrl = process.env.TURSO_DATABASE_URL ?? ""
  // Extract DB name from libsql://book-store-devlevelcoding.aws-... → "book-store-devlevelcoding"
  const dbName = dbUrl.replace("libsql://", "").split(".")[0] || "local sqlite"
  try {
    const count = await prismadb.product.count()
    return NextResponse.json({ ok: true, db: dbName, products: count })
  } catch (e: any) {
    return NextResponse.json({ ok: false, db: dbName, error: e.message }, { status: 500 })
  }
}
