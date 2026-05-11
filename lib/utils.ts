import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const truncate = (value: string, max: number) => {
  if (value.length > max) {
    return value.slice(0, max - 3) + '...'
  }

  return value
}