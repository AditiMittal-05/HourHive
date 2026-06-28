import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold " +
  "ring-offset-background transition-all duration-200 ease-in-out " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 " +
  "active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "text-white rounded-xl hover:-translate-y-0.5 " +
          "[background:linear-gradient(135deg,#2563EB_0%,#3B82F6_100%)] " +
          "shadow-[0_2px_8px_rgba(37,99,235,0.30)] " +
          "hover:shadow-[0_4px_16px_rgba(37,99,235,0.42)] " +
          "hover:[background:linear-gradient(135deg,#1D4ED8_0%,#2563EB_100%)]",
        secondary:
          "text-white rounded-xl hover:-translate-y-0.5 " +
          "[background:linear-gradient(135deg,#10B981_0%,#22C55E_100%)] " +
          "shadow-[0_2px_8px_rgba(16,185,129,0.28)] " +
          "hover:shadow-[0_4px_16px_rgba(16,185,129,0.40)] " +
          "hover:[background:linear-gradient(135deg,#059669_0%,#10B981_100%)]",
        destructive:
          "bg-danger text-white rounded-xl hover:bg-red-600 hover:-translate-y-0.5 " +
          "shadow-[0_2px_8px_rgba(239,68,68,0.25)] hover:shadow-[0_4px_12px_rgba(239,68,68,0.35)]",
        outline:
          "border border-border-color bg-white text-text-primary rounded-xl " +
          "hover:bg-primary-50 hover:border-primary/30 hover:text-primary hover:-translate-y-0.5 " +
          "shadow-[0_1px_3px_rgba(0,0,0,0.07)]",
        ghost:
          "text-text-secondary hover:bg-light-bg hover:text-text-primary rounded-xl",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto",
        success:
          "text-white rounded-xl hover:-translate-y-0.5 " +
          "[background:linear-gradient(135deg,#10B981_0%,#22C55E_100%)] " +
          "shadow-[0_2px_8px_rgba(16,185,129,0.28)] hover:shadow-[0_4px_16px_rgba(16,185,129,0.40)]",
        warning:
          "bg-warning text-white rounded-xl hover:bg-amber-600 hover:-translate-y-0.5 shadow-sm",
        "primary-outline":
          "border border-primary/20 bg-primary-50 text-primary rounded-xl " +
          "hover:bg-primary-100 hover:border-primary/40 hover:-translate-y-0.5",
        accent:
          "text-white rounded-xl hover:-translate-y-0.5 " +
          "[background:linear-gradient(135deg,#10B981_0%,#22C55E_100%)] " +
          "shadow-[0_2px_8px_rgba(16,185,129,0.28)] hover:shadow-[0_4px_16px_rgba(16,185,129,0.40)]",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-8 px-3.5 text-xs rounded-lg",
        lg: "h-11 px-7 text-base",
        xl: "h-12 px-9 text-base",
        icon: "h-9 w-9 rounded-xl",
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
