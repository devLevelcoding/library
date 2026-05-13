import prismadb from "@/lib/prismadb";
import { OrderColumn } from "./components/columns";
import { format } from "date-fns";
import { OrderClient } from "./components/client";
import { formatter } from "@/lib/utils";
import { getCurrentUser } from "@/actions/get-current-user";

export const dynamic = 'force-dynamic'

const OrdersPage = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser?.email) return null

    let formattedOrders: OrderColumn[] = []
    try {
        const orders = await prismadb.order.findMany({
            where: { userId: currentUser.id },
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
