import prismadb from "@/lib/prismadb";
import { ProductColumn } from "./components/columns";
import { format } from "date-fns";
import { ProductClient } from "./components/client";
import { formatter } from "@/lib/utils";

export const dynamic = 'force-dynamic'

const ProductsPage = async () => {
    let formattedProducts: ProductColumn[] = []
    try {
        const products = await prismadb.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: { category: true, size: true },
        })
        formattedProducts = products.map((item) => ({
            id: item.id,
            name: item.name,
            isFeatured: item.isFeatured,
            isArchived: item.isArchived,
            price: formatter.format(item.price),
            category: item.category.name,
            size: item.size.name,
            createdAt: format(item.createdAt, 'MMMM do, yyyy'),
        }));
    } catch {}

    return (
        <div>
            <ProductClient data={formattedProducts} key="name" />
        </div>
    )
}

export default ProductsPage;
