import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to safely convert value to number for display
// Handles cases where backend returns numbers as strings
export const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? null : parsed
  }
  return null
}

// Helper to format a percentage safely
export const formatPercentage = (value: unknown, decimals = 1): string => {
  const num = toNumber(value)
  return num != null ? `${num.toFixed(decimals)}%` : 'N/A'
}
