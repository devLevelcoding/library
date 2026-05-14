import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    // single categoryId or multiple (comma-separated)
    const categoryIdParam = searchParams.get("categoryId")
    const categoryIdsParam = searchParams.get("categoryIds")

    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")

    let categoryFilter: object = {}
    if (categoryIdsParam) {
      const ids = categoryIdsParam.split(",").filter(Boolean)
      categoryFilter = ids.length === 1 ? { categoryId: ids[0] } : { categoryId: { in: ids } }
    } else if (categoryIdParam) {
      categoryFilter = { categoryId: categoryIdParam }
    }

    const priceFilter =
      minPrice || maxPrice
        ? {
            price: {
              ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
              ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
            },
          }
        : {}

    const where = {
      isArchived: false,
      ...categoryFilter,
      ...priceFilter,
      images: { some: { url: { startsWith: "http" } } },
    }

    if (searchParams.get("count") === "true") {
      const count = await prismadb.product.count({ where })
      return NextResponse.json({ count })
    }

    const skip = parseInt(searchParams.get("skip") ?? "0")
    const take = parseInt(searchParams.get("take") ?? "20")

    const products = await prismadb.product.findMany({
      where,
      include: { category: true, size: true, images: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    })

    return NextResponse.json(products)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message, stack: e?.stack?.slice(0, 500) }, { status: 500 })
  }
}
