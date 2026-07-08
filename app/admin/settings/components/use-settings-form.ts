import { Setting } from "@prisma/client"
import { useState } from "react"
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    billboardImageUrl: z.string().min(1),
    billboardTitle: z.string().min(1),
    currency: z.string(),
})

export type SettingsFormValues = z.infer<typeof formSchema>

export const CURRENCIES = ['USD', 'EUR', 'RON']

interface UseSettingsFormArgs {
    setting: Setting | null
}

export function useSettingsForm({ setting }: UseSettingsFormArgs) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: setting || {
            billboardImageUrl: '',
            billboardTitle: '',
            currency: 'USD',
        }
    })

    const onSubmit = async (data: SettingsFormValues) => {
        try {
            setLoading(true)

            if (setting) {
                await axios.patch(`/api/admin/settings/${setting.id}`, data)
            } else {
                await axios.post('/api/admin/settings', data)
            }

            router.refresh()
            toast.success('Settings successfully saved!')

        } catch (error: any) {
            toast.error('Ouch, something went wrong!')
        } finally {
            setLoading(false)
        }
    }

    return { form, loading, onSubmit }
}
