import { Category, Product, Image, Size } from "@prisma/client"
import { useState } from "react"
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    name: z.string().min(1),
    images: z.object({ url: z.string() }).array().min(1),
    price: z.coerce.number().min(1),
    categoryId: z.string().min(1),
    sizeId: z.string().min(1),
    isFeatured: z.boolean().default(false).optional(),
    isArchived: z.boolean().default(false).optional()
})

export type ProductFormValues = z.infer<typeof formSchema>

interface UseProductFormArgs {
    product: (Product & { images: Image[] }) | null
}

export function useProductForm({ product }: UseProductFormArgs) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const title = product ? 'Edit product' : 'Create product'
    const description = product ? 'Edit a product.' : 'Add a new product'
    const toastMessage = product ? 'product updated.' : 'product created.'
    const action = product ? 'Save changes' : 'Create'

    const defaultValues = product ? {
        ...product,
        price: parseFloat(String(product?.price)),
    } : {
        name: '',
        images: [],
        price: 0,
        categoryId: '',
        colorId: '',
        sizeId: '',
        isFeatured: false,
        isArchived: false,
    }

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    })

    const onSubmit = async (data: ProductFormValues) => {
        try {
            setLoading(true)

            if (product) {
                await axios.patch(`/api/admin/products/${product.id}`, data)
            } else {
                await axios.post('/api/admin/products', data)
            }

            router.refresh()
            router.push('/admin/products')
            toast.success(toastMessage)

        } catch (error: any) {
            toast.error('Ouch, something went wrong!')
        } finally {
            setLoading(false)
        }
    }

    return { form, loading, title, description, action, onSubmit }
}
