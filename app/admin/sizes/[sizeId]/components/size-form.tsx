"use client"

import { Size } from "@prisma/client";
import React from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Heading } from "@/components/ui/heading";
import { useSizeForm } from "./use-size-form";

interface SizeFormProps  {
    size: Size | null,
}

const SizeForm: React.FC<SizeFormProps> = ({
    size,
}) => {
    const { form, loading, title, description, action, onSubmit } = useSizeForm({ size })

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
