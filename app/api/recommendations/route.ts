import { NextResponse } from "next/server"
import { getRecommendations } from "./get-recommendations"

/**
 * GET /api/recommendations?productId=X&limit=8
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get("productId")
  const limit = Math.min(Number(searchParams.get("limit") ?? "8"), 20)

  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 })

  const items = await getRecommendations(productId, limit)
  return NextResponse.json({ items })
}
