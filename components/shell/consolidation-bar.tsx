"use client"

import * as React from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDemo } from "@/lib/demo/store"
import { tween } from "@/lib/demo/sim"
import { cn } from "@/lib/utils"

export function ConsolidationBar({ className }: { className?: string }) {
  const { state } = useDemo()
  const target = state.progress
  const [shown, setShown] = React.useState(target)
  const prev = React.useRef(target)

  React.useEffect(() => {
    if (prev.current === target) return
    const from = prev.current
    prev.current = target
    return tween(from, target, 900, (v) => setShown(v))
  }, [target])

  const pct = Math.round(shown)
  const merged = state.mergeStatus === "merged"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("hidden items-center gap-2.5 rounded-md border bg-card px-2.5 py-1 shadow-sm lg:flex", className)} aria-label={`Consolidated into one system: ${pct}%`}>
          <span className="text-xs text-muted-foreground">Consolidated into one system</span>
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full transition-colors", merged ? "bg-merged" : "bg-signal")} style={{ width: `${shown}%` }} />
          </div>
          <span className={cn("w-8 text-right font-mono text-xs font-medium tabular", merged ? "text-merged" : "text-signal")}>{pct}%</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {merged ? "4 of 10 sources governed by the Unified Client Record" : "1 of 10 sources governed. MR-12 would bring 3 more."}
      </TooltipContent>
    </Tooltip>
  )
}
