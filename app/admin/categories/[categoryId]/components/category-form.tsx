"use client"

import { Category } from "@prisma/client";
import React, { useState } from "react";
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  enabled: z.boolean().default(false),
  parentId: z.string().nullable().optional(),
})

type CategoryFormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
  category: Category | null
  allCategories: Category[]
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, allCategories }) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const title = category ? "Edit category" : "Create category"
  const description = category ? "Edit a category." : "Add a new category"
  const toastMessage = category ? "Category updated." : "Category created."
  const action = category ? "Save changes" : "Create"

  // exclude self from parent options to avoid circular reference
  const parentOptions = allCategories.filter(
    (c) => c.id !== category?.id && !c.parentId
  )

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
      enabled: category?.enabled ?? false,
      parentId: category?.parentId ?? null,
    },
  })

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setLoading(true)
      if (category) {
        await axios.patch(`/api/admin/categories/${category.id}`, data)
      } else {
        await axios.post("/api/admin/categories", data)
      }
      router.refresh()
      router.push("/admin/categories")
      toast.success(toastMessage)
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

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

          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent category</FormLabel>
                <Select
                  disabled={loading}
                  onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                  value={field.value ?? "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="None (top level)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">— None (top level) —</SelectItem>
                    {parentOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Only top-level categories appear in the main navigation.
                </FormDescription>
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
