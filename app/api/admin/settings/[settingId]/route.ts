import prismadb from "@/lib/prismadb"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: Promise<{ settingId: string }> }) {
    try {
        const { settingId } = await params
        const { billboardImageUrl, billboardTitle } = await req.json()

        if (!billboardImageUrl) return new NextResponse("Billboard Image Url is required", { status: 400 })
        if (!billboardTitle) return new NextResponse("Billboard Title is required", { status: 400 })

        const setting = await prismadb.setting.update({
            where: { id: settingId },
            data: { billboardImageUrl, billboardTitle }
        })

        return NextResponse.json(setting)
    } catch (error) {
        console.log('[SETTING_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
