import { getSession } from "@/actions/get-current-user"
import prismadb from "@/lib/prismadb"
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(
    req: Request,
) {
    const currentSession = await getSession()

    if (!currentSession?.user?.email) {
        return new NextResponse("Unauthenticated", {status: 401})
    }

    const user = await prismadb.user.findUnique({
        where: {
            email: currentSession?.user?.email,
        }
    })

    if (!user) return new NextResponse("Outch, that was naughty!", {status: 401})

    const { productsId } = await req.json()

    if (!productsId || productsId.length === 0) {
        return new NextResponse("Product ids are required", {status: 400})
    }

    const products = await prismadb.product.findMany({
        where: {
            id: {
                in: productsId,
            }
        }
    })

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    products.forEach((product) => {
        line_items.push({
            quantity: 1,
            price_data: {
                currency: 'USD',
                product_data: {
                    name: product.name,
                },
                unit_amount: product.price.toNumber() * 100,
            },
        })
    })

    const order = await prismadb.order.create({
        data: {
            isPaid: false,
            userId: user.id,
            orderItems: {
                create: productsId.map((productId: string) => ({
                    product: {
                        connect: {
                            id: productId
                        }
                    }
                }))
            }
        }
    })

    const session = await stripe.checkout.sessions.create({
        line_items,
        mode: 'payment',
        billing_address_collection: 'required',
        phone_number_collection: {
            enabled: true,
        },
        success_url: `${process.env.NEXT_APP_URL}/cart?success=1`,
        cancel_url: `${process.env.NEXT_APP_URL}/cart?cancelled=1`,
        metadata: {
            orderId: order.id,
        }
    })

    return NextResponse.json({
        url: session.url,
    })
}