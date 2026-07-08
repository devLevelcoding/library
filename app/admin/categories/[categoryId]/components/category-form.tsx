"use client"

import { Category } from "@prisma/client";
import React from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Heading } from "@/components/ui/heading";
import { useCategoryForm } from "./use-category-form";
import { ParentCategoryField } from "./parent-category-field";

interface CategoryFormProps {
  category: Category | null
  allCategories: Category[]
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, allCategories }) => {
  const { form, loading, title, description, action, onSubmit } = useCategoryForm({ category })

  // exclude self from parent options to avoid circular reference
  const parentOptions = allCategories.filter(
    (c) => c.id !== category?.id && !c.parentId
  )

  return (
    <div>
      <Heading title={title} description={description} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-4 mt-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input disabled={loading} placeholder="Category name" {...field} />
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
                  <Textarea disabled={loading} placeholder="Category description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ParentCategoryField control={form.control} parentOptions={parentOptions} loading={loading} />

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
                  <FormLabel>Visible</FormLabel>
                  <FormDescription>Show this category in the storefront</FormDescription>
                </div>
              </FormItem>
            )}
          />

          <Button disabled={loading} type="submit">{action}</Button>
        </form>
      </Form>
    </div>
  )
}

export default CategoryForm;
