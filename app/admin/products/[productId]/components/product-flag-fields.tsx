import { Control } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { ProductFormValues } from "./use-product-form"

interface ProductFlagFieldsProps {
    control: Control<ProductFormValues>
}

export function ProductFlagFields({ control }: ProductFlagFieldsProps) {
    return (
        <>
            <FormField
                control={control}
                name="isFeatured"
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
                            <FormLabel>Featured</FormLabel>
                            <FormDescription>Product is visible on home page</FormDescription>
                        </div>
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="isArchived"
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
                            <FormLabel>Archived</FormLabel>
                            <FormDescription>Product is archived</FormDescription>
                        </div>
                    </FormItem>
                )}
            />
        </>
    )
}
