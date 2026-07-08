"use client"

import { Category, Product, Image, Size } from "@prisma/client";
import React from "react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import ImageUpload from "@/components/ui/image-upload";
import { useProductForm } from "./use-product-form";
import { ProductCategorySizeFields } from "./product-category-size-fields";
import { ProductFlagFields } from "./product-flag-fields";

interface ProductFormProps  {
    product: Product & {
        images: Image[]
      } | null;
    categories: Category[];
    sizes: Size[];
}

const ProductForm: React.FC<ProductFormProps> = ({
    product,
    categories,
    sizes,
}) => {
    const { form, loading, title, description, action, onSubmit } = useProductForm({ product })

    return <div>
        <Heading
            title={title}
            description={description}
        />
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-4 mb-4">
                <div className="gap-4 grid grid-cols-1">
                    <FormField
                        control={form.control}
                        name="images"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Images</FormLabel>
                            <FormControl>
                            <ImageUpload
                                value={field.value.map((image) => image.url)}
                                disabled={loading}
                                onChange={(url) => field.onChange([...field.value, { url }])}
                                onRemove={(url) => field.onChange([...field.value.filter((current) => current.url !== url)])}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Product Name" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                                <Input type="number" disabled={loading} placeholder="Product Price" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <ProductCategorySizeFields control={form.control} categories={categories} sizes={sizes} loading={loading} />
                    <ProductFlagFields control={form.control} />
                </div>
                <Button disabled={loading} className="ml-auto" type="submit">
                    {action}
                </Button>
            </form>

        </Form>
    </div>;
}

export default ProductForm;
