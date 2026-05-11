import prismadb from "@/lib/prismadb";
import CategoryForm from "./components/category-form";
import { Heading } from "@/components/ui/heading";

const CategoriesPage = async ({
    params
}: {
    params: {
        categoryId: string
    }
}) => {

    const category = await prismadb.category.findUnique({
        where: {
            id: params.categoryId,
        },
    })

    return (
        <div>
            <CategoryForm 
                category={category}
            />
        </div>
    )

}
 
export default CategoriesPage;