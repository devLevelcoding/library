import prismadb from "@/lib/prismadb";
import SizeForm from "./components/size-form";

const SizesPage = async ({
    params
}: {
    params: Promise<{ sizeId: string }>
}) => {
    const { sizeId } = await params

    const size = await prismadb.size.findUnique({
        where: {
            id: sizeId,
        },
    })

    return (
        <div>
            <SizeForm 
                size={size}
            />
        </div>
    )

}
 
export default SizesPage;