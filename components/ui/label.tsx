"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

/**
 * Render a styled label component that wraps Radix's LabelPrimitive.Root.
 *
 * The component applies a set of default utility classes for layout, spacing, typography,
 * and disabled-state visuals, and sets data-slot="label".
 *
 * @param className - Additional CSS classes to merge with the component's default classes
 * @returns A configured `LabelPrimitive.Root` element with merged classes and passed props
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }