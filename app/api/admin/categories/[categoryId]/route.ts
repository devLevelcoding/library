import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: Promise<{ categoryId: string }> }) {
    try {
        const { categoryId } = await params
        const body = await req.json()
        const { name, description, enabled, parentId } = body

        const category = await prismadb.category.update({
            where: { id: categoryId },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(enabled !== undefined && { enabled }),
                ...('parentId' in body && { parentId: parentId ?? null }),
            }
        })

        return NextResponse.json(category)
    } catch (error) {
        console.log('[CATEGORY_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ categoryId: string }> }) {
    try {
        const { categoryId } = await params

        if (!categoryId) {
            return new NextResponse("Category id is required", { status: 400 });
        }

        const category = await prismadb.category.delete({
            where: { id: categoryId }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.log('[CATEGORY_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
