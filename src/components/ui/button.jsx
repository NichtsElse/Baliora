/**
 * Purpose: Provides the shared button primitive used across the Baliora UI.
 * Used by: pages and components throughout the app.
 * Main dependencies: Radix Slot, cva, and the cn utility.
 * Public functions: Button and buttonVariants.
 * Side effects: none.
 */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-[0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_10px_24px_-14px_rgba(0,0,0,0.45)] hover:bg-primary/90 hover:shadow-[0_16px_30px_-16px_rgba(0,0,0,0.5)] hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_10px_24px_-14px_rgba(0,0,0,0.45)] hover:bg-destructive/90 hover:shadow-[0_16px_30px_-16px_rgba(0,0,0,0.5)] hover:-translate-y-0.5",
        outline:
          "border border-input/80 bg-background/70 backdrop-blur-sm shadow-[0_10px_24px_-18px_rgba(0,0,0,0.35)] hover:bg-accent/70 hover:text-accent-foreground hover:shadow-[0_16px_30px_-18px_rgba(0,0,0,0.4)] hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_10px_24px_-16px_rgba(0,0,0,0.3)] hover:bg-secondary/80 hover:shadow-[0_14px_28px_-18px_rgba(0,0,0,0.35)] hover:-translate-y-0.5",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-12 rounded-full px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
