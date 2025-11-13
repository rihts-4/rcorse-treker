import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Renders a styled container element for card content.
 *
 * Merges the provided `className` with the component's default styling classes and forwards all other props to the underlying `div`. The root element is marked with `data-slot="card"`.
 *
 * @param className - Additional CSS class names to merge with the card's default classes.
 * @returns The rendered `div` element representing the card.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a card header container with a responsive grid layout and standardized spacing.
 *
 * The element is marked with `data-slot="card-header"`, applies default utility classes for
 * grid layout, spacing, and responsive behavior (including a conditional layout when a
 * child has `data-slot="card-action"`), merges any provided `className`, and forwards all
 * other props to the underlying `div`.
 *
 * @returns A `div` element configured as the header area of a Card component.
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a container for a card title with title typography and spacing.
 *
 * @returns A div with `data-slot="card-title"` that applies title typographic styles and merges the provided `className`.
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

/**
 * Renders a card description container with muted, small text styling.
 *
 * The element includes `data-slot="card-description"` and applies the component's default classes while accepting additional `className` overrides.
 *
 * @returns A `div` element intended for card description content.
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * Renders a container for card actions positioned at the top-right of the card.
 *
 * Accepts standard div props and merges a provided `className` with default layout classes.
 *
 * @returns A div element with `data-slot="card-action"` and classes that align actions to the top-right of the card
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * Card content container with horizontal padding and data-slot="card-content".
 *
 * Forwards all received div props to the underlying element and merges any provided `className`.
 *
 * @returns The div element used as the card's content area.
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

/**
 * Renders a card footer container that provides horizontal padding and footer layout.
 *
 * The element includes layout classes for horizontal padding, center-aligned items, and
 * conditional top padding when a top border is present. It also sets `data-slot="card-footer"`.
 *
 * @returns A `div` element serving as the card footer with the appropriate layout and padding classes applied.
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}