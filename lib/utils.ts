import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function formatPrice(amount: number, currency = "USD", rate = 1): string {
  const converted = amount * rate
  const decimals = ["JPY", "KRW", "VND"].includes(currency) ? 0 : 2
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(converted)
}

export const truncate = (value: string, max: number) => {
  if (value.length > max) {
    return value.slice(0, max - 3) + '...'
  }

  return value
}