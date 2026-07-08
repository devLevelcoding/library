import { Category } from "@prisma/client"
import { Control } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CategoryFormValues } from "./use-category-form"

interface ParentCategoryFieldProps {
  control: Control<CategoryFormValues>
  parentOptions: Category[]
  loading: boolean
}

export function ParentCategoryField({ control, parentOptions, loading }: ParentCategoryFieldProps) {
  return (
    <FormField
      control={control}
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
  )
}
