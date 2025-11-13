import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine multiple class-name inputs into a single Tailwind-compatible class string.
 *
 * Accepts strings, arrays, objects, and other class-value shapes and produces a single
 * class list where falsy values are ignored and conflicting Tailwind utility classes
 * are resolved.
 *
 * @param inputs - One or more class-value inputs (strings, arrays, objects, etc.)
 * @returns A single string with merged, deduplicated Tailwind CSS class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}