import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params} : {
    params: {
        sizeId: string
    }
}) {
    try {
        const {
            name,
            value,
            enabled
        } = await req.json()
    
        if (!name) return new NextResponse("Name is required", {status: 400});
        if (!value) return new NextResponse("Value is required", {status: 400});
    
        const category = await prismadb.size.update({
            where: {
                id: params.sizeId
            },
            data: {
                name,
                value,
                enabled: enabled ?? false,
            }
        })
    
        return NextResponse.json(category)
    } catch (error) {
        console.log('[SIZE_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}


export async function DELETE(
    req: Request,
    { params }: { params: { sizeId: string } }
  ) {
    try {

      if (!params.sizeId) {
        return new NextResponse("Size id is required", { status: 400 });
      }
  
      const category = await prismadb.size.delete({
        where: {
          id: params.sizeId,
        }
      });
    
      return NextResponse.json(category);
    } catch (error) {
      console.log('[SIZE_DELETE]', error);
      return new NextResponse("Internal error", { status: 500 });
    }
  };