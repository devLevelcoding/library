import prismadb from "@/lib/prismadb";
import SizeForm from "./components/size-form";

const SizesPage = async ({
    params
}: {
    params: {
        sizeId: string
    }
}) => {

    const size = await prismadb.size.findUnique({
        where: {
            id: params.sizeId,
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