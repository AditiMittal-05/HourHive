import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white",
        secondary:
          "border-transparent bg-secondary-100 text-secondary-700 border-secondary-100",
        outline:
          "border-border-color text-text-secondary bg-white",
        destructive:
          "border-transparent bg-red-50 text-red-700 border border-red-100",
        success:
          "border-transparent bg-emerald-50 text-emerald-700 border border-emerald-100",
        warning:
          "border-transparent bg-amber-50 text-amber-700 border border-amber-100",
        info:
          "border-transparent bg-blue-50 text-blue-700 border border-blue-100",
        draft:
          "border border-slate-200 bg-slate-50 text-slate-600",
        submitted:
          "border border-blue-100 bg-blue-50 text-blue-700",
        approved:
          "border border-emerald-100 bg-emerald-50 text-emerald-700",
        rejected:
          "border border-red-100 bg-red-50 text-red-700",
        resubmitted:
          "border border-amber-100 bg-amber-50 text-amber-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
