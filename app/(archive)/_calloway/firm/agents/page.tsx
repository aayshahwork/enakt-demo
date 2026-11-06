"use client"

import Link from "next/link"
import { ArrowUpRight, Clock } from "lucide-react"
import { ActorAvatar, ModelBadge, getActor } from "@/components/demo/actor"
import { Card, PageHeader } from "@/components/demo/page"
import { AgentStatusPill } from "@/components/demo/verdict-pill"
import { AGENTS, AGENT_ORDER, MODEL, href } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

const LAST: Record<string, { text: string; tone?: "abort" | "signal" }> = {
  "atlas-memo-agent": { text: "Dry run 17h ago · 1 blocked", tone: "abort" },
  "connect-agent": { text: "Re-ran CR-7 checks · 17m ago", tone: "signal" },
  "portfolio-kpi-agent": { text: "Waiting on KPI cleanup" },
  "lp-letter-agent": { text: "Awaiting CCO decision", tone: "abort" },
}

export default function AgentsPage() {
  const liveAgents = useDemo((s) => s.liveAgents)
  const runPhase = useDemo((s) => s.runPhase)
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <PageHeader title="Agents" description={`Each agent is scoped to exactly the deals and data it needs, enforced at the source. ${MODEL.name}, ${MODEL.note}. Every read is logged.`} />
      <div className="grid gap-4 md:grid-cols-2">
        {AGENT_ORDER.map((id) => {
          const a = AGENTS[id]
          const status = liveAgents.includes(id) ? "live" : (a.status ?? "queued")
          const last = id === "atlas-memo-agent" && runPhase === "done" ? { text: "Last run just now · 23 files cited · 1 blocked", tone: "signal" as const } : LAST[id]
          const actsFor = a.actsFor ? getActor(a.actsFor) : null
          return (
            <Link key={a.id} href={href(`/agents/${a.id}`)} className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              <Card className="flex h-full flex-col gap-3 p-4 transition-shadow duration-150 group-hover:shadow-md">
                <div className="flex items-start gap-3">
                  <ActorAvatar id={a.id} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-mono text-[13px] font-medium">{a.name}</span>
                      <ModelBadge />
                    </div>
                    <div className="text-xs text-muted-foreground">{a.role}</div>
                  </div>
                  <AgentStatusPill status={status} />
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="text-sm leading-5 text-muted-foreground">{a.purpose}</p>
                <div className="mt-auto flex items-center gap-2 pt-1 text-xs">
                  {actsFor ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-2 py-0.5">
                      <ActorAvatar id={actsFor.id} size="xs" /> requested by {actsFor.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-2 py-0.5 text-muted-foreground">firm-wide · metadata only</span>
                  )}
                  <span className={cn("ml-auto inline-flex items-center gap-1 text-muted-foreground", last.tone === "abort" && "text-abort", last.tone === "signal" && "text-signal")}>
                    <Clock className="h-3 w-3" /> {last.text}
                  </span>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
