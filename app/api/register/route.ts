import prismadb from "@/lib/prismadb";
import bcrypt from 'bcrypt'
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const {first_name, last_name, email, password} = await req.json()


        if (!first_name) return new NextResponse("First Name is required", {status: 400})
        if (!last_name) return new NextResponse("Last Name is required", {status: 400})
        if (!email) return new NextResponse("Email is required", {status: 400})
        if (!password) return new NextResponse("Password is required", {status: 400})

        const hashedPassword = await bcrypt.hash(password, 12)

        await prismadb.user.create({
            data: {
                first_name,
                last_name,
                email,
                hashedPassword,
                role: "user",
            }
        })

        return new NextResponse("ok", {status: 200})

    } catch (error) {
        console.log('[REGISTER_POST]', error);
        return new NextResponse("Internal error", { status: 500 })
    }
}