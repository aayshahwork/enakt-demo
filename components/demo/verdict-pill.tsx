import { Badge } from "@/components/ui/badge"
import { VERDICT_LABEL, type Verdict } from "@/lib/demo/fixtures"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle2, Clock, HelpCircle, Lock } from "lucide-react"

export const VERDICT_VARIANT: Record<Verdict, "verified" | "flagged" | "abort" | "gap" | "signal"> = {
  ready: "verified",
  stale: "flagged",
  conflict: "abort",
  unverified: "gap",
  restricted: "signal",
}

export const VERDICT_COLOR: Record<Verdict, string> = {
  ready: "var(--verified)",
  stale: "var(--flagged)",
  conflict: "var(--abort)",
  unverified: "var(--gap)",
  restricted: "var(--signal)",
}

const ICON: Record<Verdict, React.ComponentType<{ className?: string }>> = {
  ready: CheckCircle2,
  stale: Clock,
  conflict: AlertTriangle,
  unverified: HelpCircle,
  restricted: Lock,
}

export function VerdictPill({ verdict, className, icon = true }: { verdict: Verdict; className?: string; icon?: boolean }) {
  const Icon = ICON[verdict]
  return (
    <Badge variant={VERDICT_VARIANT[verdict]} className={cn("whitespace-nowrap", className)}>
      {icon && <Icon className="h-3 w-3" />}
      {VERDICT_LABEL[verdict]}
    </Badge>
  )
}

export function VerdictDot({ verdict, className }: { verdict: Verdict; className?: string }) {
  return <span className={cn("inline-block h-2 w-2 rounded-full", className)} style={{ background: VERDICT_COLOR[verdict] }} />
}
