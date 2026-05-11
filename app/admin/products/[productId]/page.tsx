import prismadb from "@/lib/prismadb";
import ProductForm from "./components/product-form";

const ProductsPage = async ({
    params
}: {
    params: {
        productId: string
    }
}) => {

    const product = await prismadb.product.findUnique({
        where: {
            id: params.productId,
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