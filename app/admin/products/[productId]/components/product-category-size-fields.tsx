import { Category, Size } from "@prisma/client"
import { Control } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductFormValues } from "./use-product-form"

interface ProductCategorySizeFieldsProps {
    control: Control<ProductFormValues>
    categories: Category[]
    sizes: Size[]
    loading: boolean
}

export function ProductCategorySizeFields({ control, categories, sizes, loading }: ProductCategorySizeFieldsProps) {
    return (
        <>
            <FormField
                control={control}
                name="categoryId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue defaultValue={field.value} placeholder="Select a category" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="sizeId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Size</FormLabel>
                        <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue defaultValue={field.value} placeholder="Select a size" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {sizes.map((size) => (
                                    <SelectItem key={size.id} value={size.id}>{size.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    )
}
