"use client"
import * as React from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

/** Truncates text and shows a tooltip with the full value only when it is actually clipped. */
export function Truncate({ children, className, text }: { children: React.ReactNode; className?: string; text?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [clipped, setClipped] = React.useState(false)
  const { state } = useDemo()
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setClipped(el.scrollWidth > el.clientWidth + 1)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [children])
  const span = (
    <span ref={ref} className={cn("block truncate", className)}>
      {children}
    </span>
  )
  if (!clipped || state.rec) return span
  return (
    <Tooltip>
      <TooltipTrigger asChild>{span}</TooltipTrigger>
      <TooltipContent>{text ?? (typeof children === "string" ? children : null)}</TooltipContent>
    </Tooltip>
  )
}
