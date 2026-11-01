import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        signal: "border-transparent bg-signal-soft text-signal",
        verified: "border-transparent bg-verified-soft text-verified",
        flagged: "border-transparent bg-flagged-soft text-flagged",
        gap: "border-transparent bg-gap-soft text-gap",
        abort: "border-transparent bg-abort-soft text-abort",
        merged: "border-transparent bg-merged-soft text-merged",
        stale: "border-transparent bg-stale-soft text-stale",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
