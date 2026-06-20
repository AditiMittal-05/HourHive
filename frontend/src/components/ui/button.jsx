import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary-600 shadow-sm active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-500 shadow-sm active:scale-[0.98]",
        destructive:
          "bg-danger text-white hover:bg-red-600 shadow-sm active:scale-[0.98]",
        outline:
          "border border-border-color bg-white hover:bg-light-bg text-text-primary hover:border-primary/30",
        ghost:
          "hover:bg-light-bg text-text-secondary hover:text-text-primary",
        link:
          "text-primary underline-offset-4 hover:underline",
        success:
          "bg-success text-white hover:bg-green-600 shadow-sm active:scale-[0.98]",
        warning:
          "bg-warning text-white hover:bg-amber-600 shadow-sm active:scale-[0.98]",
        "primary-outline":
          "border border-primary/30 bg-primary-50 text-primary hover:bg-primary-100",
        "accent":
          "bg-secondary text-secondary-foreground hover:bg-secondary-500 shadow-sm font-semibold active:scale-[0.98]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-7 text-base",
        xl: "h-12 rounded-lg px-9 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {children}
          </>
        ) : children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
