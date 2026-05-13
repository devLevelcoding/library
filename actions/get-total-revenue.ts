import prismadb from "@/lib/prismadb";

export const getTotalRevenue = async () => {
  try {
    const paidOrders = await prismadb.order.findMany({
      where: { isPaid: true },
      include: { orderItems: { include: { product: true } } }
    });
    return paidOrders.reduce((total, order) =>
      total + order.orderItems.reduce((sum, item) => sum + item.product.price, 0), 0);
  } catch { return 0 }
};
