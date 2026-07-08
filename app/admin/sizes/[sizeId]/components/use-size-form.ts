import { Size } from "@prisma/client"
import { useState } from "react"
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    name: z.string().min(1),
    value: z.string().min(1),
    enabled: z.boolean().optional().default(false),
})

export type SizeFormValues = z.infer<typeof formSchema>

interface UseSizeFormArgs {
    size: Size | null
}

export function useSizeForm({ size }: UseSizeFormArgs) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const title = size ? 'Edit size' : 'Create size'
    const description = size ? 'Edit a size.' : 'Add a new size'
    const toastMessage = size ? 'size updated.' : 'size created.'
    const action = size ? 'Save changes' : 'Create'

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

    return { form, loading, title, description, action, onSubmit }
}
