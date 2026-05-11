"use client"

import { Size, Setting } from "@prisma/client";
import React, { useState } from "react";


import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Heading } from "@/components/ui/heading";

const formSchema = z.object({
    name: z.string().min(1),
    value: z.string().min(1),
    enabled: z.boolean().optional().default(false),
})

type SizeFormValues = z.infer<typeof formSchema>

interface SizeFormProps  {
    size: Size | null,
}

const SizeForm: React.FC<SizeFormProps> = ({
    size,
}) => {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const title = size ? 'Edit size' : 'Create size';
    const description = size ? 'Edit a size.' : 'Add a new size';
    const toastMessage = size ? 'size updated.' : 'size created.';
    const action = size ? 'Save changes' : 'Create';

    const form = useForm<SizeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: size || {
            name: '',
            value: '',
            enabled: false,
        }
    })

    const onSubmit = async (data: SizeFormValues) => {
        try {
            setLoading(true)

            if (size) {
                await axios.patch(`/api/admin/sizes/${size.id}`, data)
            } else {
                await axios.post('/api/admin/sizes', data)
            }

            router.refresh()
            router.push('/admin/sizes')
            toast.success(toastMessage)

        } catch (error: any) {
            toast.error('Please delete first all products using this size')
        } finally {
            setLoading(false)
        }
    }

    return <div>
        <Heading 
            title={title}
            description={description}
        />
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-4">
                <div className="gap-4 grid grid-cols-1">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Size Name" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Size</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Size Name" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="enabled"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                checked={field.value}
                                // @ts-ignore
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Enabled
                                </FormLabel>
                                <FormDescription>
                                    Size is visible in the front area
                                </FormDescription>
                            </div>
                            </FormItem>
                        )}
                        />
                </div>
                <Button disabled={loading} className="ml-auto" type="submit">
                    {action}
                </Button>
            </form>

        </Form>
    </div>;
}
 
export default SizeForm;