"use client"

import { Setting } from "@prisma/client";
import React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/ui/image-upload";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCIES, useSettingsForm } from "./use-settings-form";

interface SettingsFormProps  {
    setting: Setting | null,
}

const SettingsForm: React.FC<SettingsFormProps> = ({
    setting,
}) => {
    const { form, loading, onSubmit } = useSettingsForm({ setting })

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
                                {CURRENCIES.map((currency) => (
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
