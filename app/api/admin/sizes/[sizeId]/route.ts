import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: Promise<{ sizeId: string }> }) {
    try {
        const { sizeId } = await params
        const { name, value, enabled } = await req.json()

        if (!name) return new NextResponse("Name is required", { status: 400 });
        if (!value) return new NextResponse("Value is required", { status: 400 });

        const size = await prismadb.size.update({
            where: { id: sizeId },
            data: { name, value, enabled: enabled ?? false }
        })

        return NextResponse.json(size)
    } catch (error) {
        console.log('[SIZE_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ sizeId: string }> }) {
    try {
        const { sizeId } = await params

        if (!sizeId) {
            return new NextResponse("Size id is required", { status: 400 });
        }

        const size = await prismadb.size.delete({
            where: { id: sizeId }
        });

        return NextResponse.json(size);
    } catch (error) {
        console.log('[SIZE_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
