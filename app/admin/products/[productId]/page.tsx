import prismadb from "@/lib/prismadb";
import ProductForm from "./components/product-form";

export const dynamic = 'force-dynamic'

const ProductsPage = async ({
    params
}: {
    params: Promise<{ productId: string }>
}) => {
    const { productId } = await params

    const product = await prismadb.product.findUnique({
        where: {
            id: productId,
        },
        include: {
            images: true,
        }
    })

    const categories = await prismadb.category.findMany({
        where: {
            enabled: true,
        }
    });
    
    const sizes = await prismadb.size.findMany({
        where: {
            enabled: true,
        }
    });

    return (
        <div>
            <ProductForm 
                product={product}
                sizes={sizes}
                categories={categories}
            />
        </div>
    )

}
 
export default ProductsPage;