"use client"

import React, { useState } from "react";


import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    email: z.string().email().min(1),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    password: z.string().min(8),
})

type SignUpFormValues = z.infer<typeof formSchema>

const SignUp = () => {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues:  {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
        }
    })

    const onSubmit = async (data: SignUpFormValues) => {
        try {
            setLoading(true)

            await axios.post('/api/register', data)

            router.push('/sign-in')
            toast.success('Your account has been created, please log in')

        } catch (error: any) {
            toast.error('Ouch, something went wrong!')
        } finally {
            setLoading(false)
        }
    }

    return <div className="max-w-lg mx-auto min-h-full w-full mt-32">
            <div>
            <div className="w-full mb-2">
                <h2 className="text-4xl font-bold text-left">Create Account</h2>
                <p className="text-muted-foreground">Creating an account will help you access all features</p>
                <hr className="my-4"/>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                    <div className="gap-4">
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input disabled={loading} placeholder="Your name..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="last_name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input disabled={loading} placeholder="Your name..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
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
                        Sign Up
                    </Button>
                </form>
            </Form>
            </div>
    </div>;
}
 
export default SignUp;