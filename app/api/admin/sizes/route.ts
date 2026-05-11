import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const {
            name,
            value,
            enabled
        } = await req.json()
    
        if (!name) return new NextResponse("Name is required", {status: 400});
        if (!value) return new NextResponse("Value is required", {status: 400});
    
        const size = await prismadb.size.create({
            data: {
                name,
                value,
                enabled: enabled ?? false,
            }
        })
    
        return NextResponse.json(size)
    } catch (error) {
        console.log('[SIZE_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}