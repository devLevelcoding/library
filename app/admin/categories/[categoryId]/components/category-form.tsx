"use client"

import { Category, Setting } from "@prisma/client";
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
    description: z.string().min(1),
    enabled: z.boolean().optional().default(false),
})

type CategoryFormValues = z.infer<typeof formSchema>

interface CategoryFormProps  {
    category: Category | null,
}

const CategoryForm: React.FC<CategoryFormProps> = ({
    category,
}) => {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const title = category ? 'Edit category' : 'Create category';
    const description = category ? 'Edit a category.' : 'Add a new category';
    const toastMessage = category ? 'category updated.' : 'category created.';
    const action = category ? 'Save changes' : 'Create';

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: category || {
            name: '',
            description: '',
            enabled: false,
        }
    })

    const onSubmit = async (data: CategoryFormValues) => {
        try {
            setLoading(true)

            if (category) {
                await axios.patch(`/api/admin/categories/${category.id}`, data)
            } else {
                await axios.post('/api/admin/categories', data)
            }

            router.refresh()
            router.push('/admin/categories')
            toast.success(toastMessage)

        } catch (error: any) {
            toast.error('Please delete first all products using this category.')
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
                                <Input disabled={loading} placeholder="Category Name" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea disabled={loading} placeholder="Category Description" {...field} />
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
                                    Category is visible in the front area
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
 
export default CategoryForm;