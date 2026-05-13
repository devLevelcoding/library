import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params

    if (!productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: { id: productId },
      include: { images: true, category: true, size: true }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params

    if (!productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const product = await prismadb.product.delete({
      where: { id: productId }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params
    const body = await req.json();
    const { name, price, categoryId, images, sizeId, isFeatured, isArchived } = body;

    if (!productId) return new NextResponse("Product id is required", { status: 400 });
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!images || !images.length) return new NextResponse("Images are required", { status: 400 });
    if (!price) return new NextResponse("Price is required", { status: 400 });
    if (!categoryId) return new NextResponse("Category id is required", { status: 400 });
    if (!sizeId) return new NextResponse("Size id is required", { status: 400 });

    await prismadb.product.update({
      where: { id: productId },
      data: {
        name, price, categoryId, sizeId,
        images: { deleteMany: {} },
        isFeatured,
        isArchived,
      },
    });

    const product = await prismadb.product.update({
      where: { id: productId },
      data: {
        images: {
          createMany: {
            data: images.map((image: { url: string }) => image),
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
