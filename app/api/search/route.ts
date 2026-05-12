import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")?.trim()
    if (!q || q.length < 2) return NextResponse.json([])

    const products = await prismadb.product.findMany({
      where: {
        isArchived: false,
        name: { contains: q },
        images: { some: { url: { startsWith: "http" } } },
      },
      include: { category: true, images: { take: 1 } },
      orderBy: { name: "asc" },
      take: 8,
    })

    return NextResponse.json(products)
  } catch {
    return new NextResponse("Internal error", { status: 500 })
  }
}
