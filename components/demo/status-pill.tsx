import { Badge } from "@/components/ui/badge"
import { COLOUR_LABEL, STAGE_LABEL, type Colour, type Stage } from "@/lib/demo/fixtures"
import { cn } from "@/lib/utils"

/** Readiness colours: green merged, yellow in progress, red not ready, black restricted. */
export const COLOUR_VAR: Record<Colour, string> = { green: "var(--verified)", yellow: "var(--flagged)", red: "var(--abort)", black: "var(--ink)" }
export const COLOUR_HEX: Record<Colour, string> = { green: "#2e6f4e", yellow: "#9a6b00", red: "#a33a2c", black: "#191917" }

const COLOUR_CLS: Record<Colour, string> = {
  green: "border-transparent bg-verified-soft text-verified",
  yellow: "border-transparent bg-flagged-soft text-flagged",
  red: "border-transparent bg-abort-soft text-abort",
  black: "border-transparent bg-ink text-paper",
}

export function ColourDot({ colour, className }: { colour: Colour; className?: string }) {
  return <span className={cn("inline-block h-2 w-2 shrink-0 rounded-full", className)} style={{ background: COLOUR_VAR[colour] }} />
}

export function ColourPill({ colour, className, label }: { colour: Colour; className?: string; label?: string }) {
  return (
    <Badge variant="outline" className={cn("whitespace-nowrap", COLOUR_CLS[colour], className)}>
      <ColourDot colour={colour} className={colour === "black" ? "!bg-paper" : undefined} />
      {label ?? COLOUR_LABEL[colour]}
    </Badge>
  )
}

const STAGE_VARIANT: Record<Stage, "gap" | "signal" | "flagged" | "merged" | "verified"> = { requested: "gap", scoping: "signal", building: "flagged", review: "merged", deployed: "verified", learning: "verified" }

export function StagePill({ stage, className }: { stage: Stage; className?: string }) {
  return (
    <Badge variant={STAGE_VARIANT[stage]} className={cn("whitespace-nowrap", className)}>
      {(stage === "scoping" || stage === "building") && <span className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-current" />}
      {STAGE_LABEL[stage]}
    </Badge>
  )
}
