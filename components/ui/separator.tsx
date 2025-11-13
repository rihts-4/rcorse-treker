"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

/**
 * Render an oriented separator element with optional custom styling.
 *
 * Renders a Radix Separator root with orientation-aware sizing, a data-slot of `"separator"`, and any additional props forwarded to the underlying element.
 *
 * @param className - Additional CSS class names to apply to the separator
 * @param orientation - Layout orientation of the separator; either `"horizontal"` or `"vertical"` (default: `"horizontal"`)
 * @param decorative - Indicates whether the separator is purely decorative (default: `true`)
 * @param props - Additional props forwarded to `SeparatorPrimitive.Root`
 * @returns A React element representing the separator
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }