import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const {billboardImageUrl, billboardTitle} = await req.json()

        if (!billboardImageUrl) return new NextResponse("Billboard Image Url is required", {status: 400})
        if (!billboardTitle) return new NextResponse("Billboard Title is required", {status: 400})

        const setting = await prismadb.setting.create({
            data: {
                billboardImageUrl,
                billboardTitle
            }
        })

        return NextResponse.json(setting)
    } catch (error) {
        console.log('[SETTING_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

