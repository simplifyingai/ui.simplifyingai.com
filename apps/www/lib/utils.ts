import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ui.simplifyingai.com"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  return `${APP_URL}${path}`
}
