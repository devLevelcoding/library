import prismadb from "@/lib/prismadb";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

export async function getSession() {
    return await getServerSession(authOptions)
}

export async function getCurrentUser() {
    try {
        const session = await getSession()

        if (!session?.user?.email) return null

        const user = await prismadb.user.findUnique({
            where: {
                email: session.user.email,
            }
        })

        return user
    
    } catch (error) {
        return null
    }
}