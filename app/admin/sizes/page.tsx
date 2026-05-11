import prismadb from "@/lib/prismadb";
import { SizeColumn } from "./components/columns";
import { format } from "date-fns";
import { SizeClient } from "./components/client";

const SizesPage = async () => {

    const Sizes = await prismadb.size.findMany({
        orderBy: {
            createdAt: 'desc',
        }
    })

    
    const formattedSizes: SizeColumn[] = Sizes.map((size) => ({
        id: size.id,
        name: size.name,
        value: size.value,
        enabled: size.enabled,
        createdAt: format(size.createdAt, 'MMMM do, yyyy'),
    }))


    return (
        <div>
            <SizeClient 
                data={formattedSizes}
                key="name"
            />
        </div>
    )

}
 
export default SizesPage;