"use client"

import { Setting } from "@prisma/client";
import React, { useState } from "react";


import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/ui/image-upload";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
    billboardImageUrl: z.string().min(1),
    billboardTitle: z.string().min(1),
    currency: z.string(),
})

type SettingsFormValues = z.infer<typeof formSchema>

interface SettingsFormProps  {
    setting: Setting | null,
}

const SettingsForm: React.FC<SettingsFormProps> = ({
    setting,
}) => {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const currencies = ['USD', 'EUR', 'RON']

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

    return <div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="billboardImageUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Billboard Image</FormLabel>
                        <FormControl>
                            <ImageUpload 
                                value={field.value ? [field.value] : []} 
                                disabled={loading} 
                                onChange={(url) => field.onChange(url)}
                                onRemove={() => field.onChange('')}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="gap-4 grid grid-cols-3">
                    <FormField
                    control={form.control}
                    name="billboardTitle"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Billboard Title</FormLabel>
                        <FormControl>
                            <Input disabled={loading} placeholder="Billboard Title" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue defaultValue={field.value} placeholder="Select Currency" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {currencies.map((currency) => (
                                    <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button disabled={loading} className="ml-auto" type="submit">
                    Save
                </Button>
            </form>

        </Form>
    </div>;
}
 
export default SettingsForm;