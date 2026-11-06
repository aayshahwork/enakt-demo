import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PEOPLE, type Actor } from "@/lib/demo/fixtures"
import { cn } from "@/lib/utils"
import { Users } from "lucide-react"
import { EMark } from "./logo"

const HUES: Record<string, string> = {
  maya: "bg-signal-soft text-signal",
  daniel: "bg-verified-soft text-verified",
  ruth: "bg-merged-soft text-merged",
  leo: "bg-flagged-soft text-flagged",
}

export function getActor(id: string): Actor {
  return PEOPLE[id] ?? { id, name: id, role: "", kind: "person", initials: id.slice(0, 2).toUpperCase() }
}

export function ActorAvatar({ id, size = "md", className }: { id: string; size?: "xs" | "sm" | "md" | "lg"; className?: string }) {
  const a = getActor(id)
  const dim = { xs: "h-5 w-5 text-[9px]", sm: "h-6 w-6 text-[10px]", md: "h-8 w-8 text-xs", lg: "h-10 w-10 text-sm" }[size]
  const px = { xs: 20, sm: 24, md: 32, lg: 40 }[size]
  if (a.kind === "agent") return <EMark size={px} className={className} />
  if (a.kind === "team") {
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

export function ActorName({ id, withRole, className }: { id: string; withRole?: boolean; className?: string }) {
  const a = getActor(id)
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="font-medium">{a.name}</span>
      {withRole && a.role && <span className="text-muted-foreground">· {a.role}</span>}
    </span>
  )
}
