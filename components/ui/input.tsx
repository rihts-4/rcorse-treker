import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Styled input component that composes default utility classes, applies a data-slot, and forwards all native input props.
 *
 * @param className - Additional CSS class names to merge with the component's default classes
 * @param type - The input `type` attribute value (e.g., "text", "email", "password")
 * @returns A rendered `<input>` element with the composed `className`, `data-slot="input"`, the specified `type`, and all other provided props forwarded
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }