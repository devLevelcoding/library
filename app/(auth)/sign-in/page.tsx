"use client"

import React, { useState } from "react";


import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation";

const formSchema = z.object({
    email: z.string().email().min(1),
    password: z.string().min(8),
})

type SignInFormValues = z.infer<typeof formSchema>


const SignIn = () => {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<SignInFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues:  {
            email: '',
            password: '',
        }
    })

    const onSubmit = async (data: SignInFormValues) => {
        const result = await signIn('credentials', {
            ...data,
           redirect: false,
        })

        if (result?.error) {
            toast.error(result.error);
        } else {
            router.refresh()
            router.push('/')
        }

        setLoading(false)
    }

    return <div className="max-w-lg mx-auto min-h-full w-full mt-32">
            <div>
            <div className="w-full mb-2">
                <h2 className="text-4xl font-bold text-left">Welcome back</h2>
                <p className="text-muted-foreground">Signing in into your account</p>
                <hr className="my-4"/>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                    <div className="gap-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input disabled={loading} placeholder="Your email..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" disabled={loading} placeholder="Password..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button disabled={loading} className="ml-auto" type="submit">
                        Sign In
                    </Button>
                </form>
            </Form>
            </div>
    </div>;
}
 
export default SignIn