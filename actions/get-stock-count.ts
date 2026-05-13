import prismadb from "@/lib/prismadb";

export const getStockCount = async () => {
  try {
    return await prismadb.product.count({ where: { isArchived: false } });
  } catch { return 0 }
};
