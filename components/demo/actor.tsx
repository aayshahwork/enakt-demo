import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ACTORS, type Actor } from "@/lib/demo/fixtures"
import { cn } from "@/lib/utils"
import { Bot, Users } from "lucide-react"

const HUES: Record<string, string> = {
  dana: "bg-signal-soft text-signal",
  ellen: "bg-merged-soft text-merged",
  tom: "bg-verified-soft text-verified",
  nina: "bg-flagged-soft text-flagged",
  owen: "bg-stale-soft text-stale",
  grace: "bg-abort-soft text-abort",
  "atlas-team": "bg-gap-soft text-gap",
}

export function getActor(id: string): Actor {
  return ACTORS[id] ?? { id, name: id, role: "", kind: "person", initials: id.slice(0, 2).toUpperCase() }
}

export function ActorAvatar({ id, size = "md", className }: { id: string; size?: "xs" | "sm" | "md" | "lg"; className?: string }) {
  const a = getActor(id)
  const dim = { xs: "h-5 w-5 text-[9px]", sm: "h-6 w-6 text-[10px]", md: "h-8 w-8 text-xs", lg: "h-10 w-10 text-sm" }[size]
  if (a.kind === "agent") {
    return (
      <span className={cn("inline-flex shrink-0 items-center justify-center rounded-md border border-dashed border-signal/40 bg-signal-soft text-signal", dim, className)} title={a.name}>
        <Bot className="h-[60%] w-[60%]" />
      </span>
    )
  }
  if (a.kind === "group") {
    return (
      <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-gap-soft text-gap", dim, className)} title={a.name}>
        <Users className="h-[55%] w-[55%]" />
      </span>
    )
  }
  return (
    <Avatar className={cn(dim, className)}>
      <AvatarFallback className={cn("font-medium", HUES[a.id] ?? "bg-muted")}>{a.initials}</AvatarFallback>
    </Avatar>
  )
}

/** Every agent runs on the in-tenant model. */
export function ModelBadge({ className }: { className?: string }) {
  return (
    <Badge variant="gap" className={cn("font-mono text-[10px]", className)}>
      in-tenant model
    </Badge>
  )
}

export function ActorName({ id, withRole, withModel = true, className }: { id: string; withRole?: boolean; withModel?: boolean; className?: string }) {
  const a = getActor(id)
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("font-medium", a.kind === "agent" && "font-mono text-[13px]")}>{a.name}</span>
      {withModel && a.kind === "agent" && <ModelBadge />}
      {withRole && a.role && <span className="text-muted-foreground">· {a.role}</span>}
    </span>
  )
}

export function ActorChip({ id, size = "sm", withRole, withModel }: { id: string; size?: "xs" | "sm" | "md"; withRole?: boolean; withModel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <ActorAvatar id={id} size={size} />
      <ActorName id={id} withRole={withRole} withModel={withModel} />
    </span>
  )
}
