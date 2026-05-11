import prismadb from "@/lib/prismadb";
import { cn } from "@/lib/utils";
import CategoriesNavItem from "./categories-nav-item";
import CategoriesNavList from "./categories-nav-list";

const CategoriesNav = async () => {
    const categories = await prismadb.category.findMany({
        where: {
            enabled: true,
        }
    })

    return <CategoriesNavList categories={categories} />
}
 
export default CategoriesNav;