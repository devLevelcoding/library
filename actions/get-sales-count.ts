import prismadb from "@/lib/prismadb";

export const getSalesCount = async () => {
  try {
    return await prismadb.order.count({ where: { isPaid: true } });
  } catch { return 0 }
};
