import prismadb from "@/lib/prismadb";
import { Heading } from "@/components/ui/heading";
import { OrderColumn } from "./components/columns";
import { format } from "date-fns";
import { OrderClient } from "./components/client";
import { formatter } from "@/lib/utils";

export const dynamic = 'force-dynamic'

const OrdersPage = async () => {
    let formattedOrders: OrderColumn[] = []
    try {
        const orders = await prismadb.order.findMany({
            include: {
              orderItems: { include: { product: true } },
              user: true,
            },
            orderBy: { createdAt: 'desc' }
        });
        formattedOrders = orders.map((item) => ({
            id: item.id,
            user: item.user.first_name + ' ' + item.user.last_name,
            phone: item.phone,
            address: item.address,
            products: item.orderItems.map((orderItem) => orderItem.product.name).join(', '),
            totalPrice: formatter.format(item.orderItems.reduce((total, item) => total + Number(item.product.price), 0)),
            isPaid: item.isPaid,
            createdAt: format(item.createdAt, 'MMMM do, yyyy'),
        }));
    } catch {}

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 py-6">
                <OrderClient data={formattedOrders} />
            </div>
        </div>
    )
}

export default OrdersPage;
