import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string | Date): string {
  const date = new Date(dateStr)
  const day = String(date.getDate()).padStart(2, "0")
  const month = date.toLocaleString("en-US", { month: "short" })
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}
