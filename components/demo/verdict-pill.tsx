import { Badge } from "@/components/ui/badge"
import { VERDICT_LABEL, type Verdict } from "@/lib/demo/fixtures"
import { cn } from "@/lib/utils"
import { AlertTriangle, Brain, CheckCircle2, Circle, Clock, HelpCircle, Lock, Wrench } from "lucide-react"

export const VERDICT_VARIANT: Record<Verdict, "verified" | "flagged" | "abort" | "gap" | "signal" | "merged" | "stale" | "outline"> = {
  unchecked: "outline",
  inbrain: "verified",
  ready: "signal",
  cleaning: "flagged",
  conflict: "abort",
  stale: "stale",
  unverified: "gap",
  restricted: "merged",
}

export const VERDICT_COLOR: Record<Verdict, string> = {
  unchecked: "var(--gap)",
  inbrain: "var(--verified)",
  ready: "var(--signal)",
  cleaning: "var(--flagged)",
  conflict: "var(--abort)",
  stale: "var(--stale)",
  unverified: "var(--gap)",
  restricted: "var(--merged)",
}

export const VERDICT_HEX: Record<Verdict, string> = {
  unchecked: "#b8b4aa",
  inbrain: "#2e6f4e",
  ready: "#16456b",
  cleaning: "#9a6b00",
  conflict: "#a33a2c",
  stale: "#b4591e",
  unverified: "#6f6b63",
  restricted: "#6b4fbb",
}

export const VERDICT_ICON: Record<Verdict, React.ComponentType<{ className?: string }>> = {
  unchecked: Circle,
  inbrain: Brain,
  ready: CheckCircle2,
  cleaning: Wrench,
  conflict: AlertTriangle,
  stale: Clock,
  unverified: HelpCircle,
  restricted: Lock,
}

export function VerdictPill({ verdict, className, icon = true, label }: { verdict: Verdict; className?: string; icon?: boolean; label?: string }) {
  const Icon = VERDICT_ICON[verdict]
  return (
    <Badge variant={VERDICT_VARIANT[verdict]} className={cn("whitespace-nowrap", verdict === "unchecked" && "border-dashed text-muted-foreground", className)}>
      {icon && <Icon className="h-3 w-3" />}
      {label ?? VERDICT_LABEL[verdict]}
    </Badge>
  )
}

export function VerdictDot({ verdict, className }: { verdict: Verdict; className?: string }) {
  return <span className={cn("inline-block h-2 w-2 rounded-full", className)} style={{ background: VERDICT_COLOR[verdict] }} />
}
