import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { name, description, enabled, parentId } = await req.json()

    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!description) return new NextResponse("Description is required", { status: 400 });

    const category = await prismadb.category.create({
      data: {
        name,
        description,
        enabled: enabled ?? false,
        parentId: parentId ?? null,
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.log('[CATEGORY_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
