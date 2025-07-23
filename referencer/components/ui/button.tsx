import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-primary-foreground shadow hover:bg-primary/90": variant === "default",
            "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80": variant === "secondary",
            "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground": variant === "outline",
          },
          {
            "h-9 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-10 rounded-md px-8": size === "lg",
          },
          // Default Tailwind classes for basic styling
          variant === "default" && "bg-blue-600 text-white hover:bg-blue-700",
          variant === "secondary" && "bg-gray-100 text-gray-900 hover:bg-gray-200",
          variant === "outline" && "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
