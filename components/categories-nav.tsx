import prismadb from "@/lib/prismadb";
import CategoriesNavList from "./categories-nav-list";

const CategoriesNav = async () => {
  const categories = await prismadb.category.findMany({
    where: { enabled: true, parentId: null },
    include: {
      children: {
        where: { enabled: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  })

  return <CategoriesNavList categories={categories} />
}

export default CategoriesNav;
