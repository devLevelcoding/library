import { useState } from "react"
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    email: z.string().email().min(1),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    password: z.string().min(8),
})

export type SignUpFormValues = z.infer<typeof formSchema>

export function useSignUpForm() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
        }
    })

    const onSubmit = async (data: SignUpFormValues) => {
        try {
            setLoading(true)

            await axios.post('/api/register', data)

            router.push('/sign-in')
            toast.success('Your account has been created, please log in')

        } catch (error: any) {
            toast.error('Ouch, something went wrong!')
        } finally {
            setLoading(false)
        }
    }

    return { form, loading, onSubmit }
}
