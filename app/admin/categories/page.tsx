import prismadb from "@/lib/prismadb";
import { Heading } from "@/components/ui/heading";
import { CategoryColumn } from "./components/columns";
import { format } from "date-fns";
import { CategoryClient } from "./components/client";

const CategoriesPage = async () => {

    const categories = await prismadb.category.findMany({
        orderBy: {
            createdAt: 'desc',
        }
    })

    
    const formattedCategories: CategoryColumn[] = categories.map((category) => ({
        id: category.id,
        name: category.name,
        enabled: category.enabled,
        createdAt: format(category.createdAt, 'MMMM do, yyyy'),
    }))


    return (
        <div>
            <CategoryClient 
                data={formattedCategories}
                key="name"
            />
        </div>
    )

}
 
export default CategoriesPage;