import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const skip = parseInt(searchParams.get("skip") ?? "0")
    const take = parseInt(searchParams.get("take") ?? "20")
    const categoryId = searchParams.get("categoryId") ?? undefined

    const products = await prismadb.product.findMany({
      where: {
        isArchived: false,
        ...(categoryId ? { categoryId } : {}),
      },
      include: { category: true, size: true, images: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    })

    return NextResponse.json(products)
  } catch {
    return new NextResponse("Internal error", { status: 500 })
  }
}
