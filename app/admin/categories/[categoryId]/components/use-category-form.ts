import { Category } from "@prisma/client"
import { useState } from "react"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  enabled: z.boolean().default(false),
  parentId: z.string().nullable().optional(),
})

export type CategoryFormValues = z.infer<typeof formSchema>

interface UseCategoryFormArgs {
  category: Category | null
}

export function useCategoryForm({ category }: UseCategoryFormArgs) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const title = category ? "Edit category" : "Create category"
  const description = category ? "Edit a category." : "Add a new category"
  const toastMessage = category ? "Category updated." : "Category created."
  const action = category ? "Save changes" : "Create"

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

  return { form, loading, title, description, action, onSubmit }
}
