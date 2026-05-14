import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET() {
  try {
    const count = await prismadb.product.count()
    return NextResponse.json({ ok: true, products: count, turso: !!process.env.TURSO_DATABASE_URL })
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: e.message,
      turso: !!process.env.TURSO_DATABASE_URL,
      url: process.env.TURSO_DATABASE_URL?.slice(0, 30) + "...",
    }, { status: 500 })
  }
}
