import prismadb from "@/lib/prismadb";
import { SizeColumn } from "./components/columns";
import { format } from "date-fns";
import { SizeClient } from "./components/client";

export const dynamic = 'force-dynamic'

const SizesPage = async () => {
    let formattedSizes: SizeColumn[] = []
    try {
        const sizes = await prismadb.size.findMany({
            orderBy: { createdAt: 'desc' }
        })
        formattedSizes = sizes.map((size) => ({
            id: size.id,
            name: size.name,
            value: size.value,
            enabled: size.enabled,
            createdAt: format(size.createdAt, 'MMMM do, yyyy'),
        }))
    } catch {}

    return (
        <div>
            <SizeClient data={formattedSizes} key="name" />
        </div>
    )
}

export default SizesPage;
