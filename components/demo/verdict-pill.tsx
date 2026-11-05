import { Badge } from "@/components/ui/badge"
import { AGENT_STATUS_LABEL, REQUEST_STATUS_LABEL, VERDICT_LABEL, type AgentStatus, type RequestStatus, type Verdict } from "@/lib/demo/fixtures"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle2, Circle, Lock, Wrench } from "lucide-react"

/** One token set for every status pill: green / yellow / red / purple policy / blue in-progress. */
export const VERDICT_VARIANT: Record<Verdict, "verified" | "flagged" | "abort" | "gap" | "signal" | "merged" | "outline"> = {
  unchecked: "outline",
  ready: "verified",
  attention: "flagged",
  conflict: "abort",
  restricted: "abort",
}

export const VERDICT_COLOR: Record<Verdict, string> = {
  unchecked: "var(--gap)",
  ready: "var(--verified)",
  attention: "var(--flagged)",
  conflict: "var(--abort)",
  restricted: "var(--abort)",
}

export const VERDICT_HEX: Record<Verdict, string> = {
  unchecked: "#b8b4aa",
  ready: "#2e6f4e",
  attention: "#9a6b00",
  conflict: "#a33a2c",
  restricted: "#a33a2c",
}

export const VERDICT_ICON: Record<Verdict, React.ComponentType<{ className?: string }>> = {
  unchecked: Circle,
  ready: CheckCircle2,
  attention: Wrench,
  conflict: AlertTriangle,
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

export const AGENT_STATUS_VARIANT: Record<AgentStatus, "verified" | "signal" | "gap" | "abort"> = { live: "verified", build: "signal", queued: "gap", blocked: "abort" }

export function AgentStatusPill({ status, className }: { status: AgentStatus; className?: string }) {
  return (
    <Badge variant={AGENT_STATUS_VARIANT[status]} className={cn("whitespace-nowrap", className)}>
      {status === "live" && <span className="h-1.5 w-1.5 rounded-full bg-verified" />}
      {status === "build" && <span className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-signal" />}
      {status === "blocked" && <Lock className="h-3 w-3" />}
      {AGENT_STATUS_LABEL[status]}
    </Badge>
  )
}

const REQUEST_VARIANT: Record<RequestStatus, "verified" | "signal" | "gap" | "abort"> = { done: "verified", scoping: "signal", scoped: "verified", queued: "gap", blocked: "abort" }

export function RequestStatusPill({ status, className }: { status: RequestStatus; className?: string }) {
  return (
    <Badge variant={REQUEST_VARIANT[status]} className={cn("whitespace-nowrap", className)}>
      {status === "scoping" && <span className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-signal" />}
      {REQUEST_STATUS_LABEL[status]}
    </Badge>
  )
}

export function VerdictDot({ verdict, className }: { verdict: Verdict; className?: string }) {
  return <span className={cn("inline-block h-2 w-2 rounded-full", className)} style={{ background: VERDICT_COLOR[verdict] }} />
}
