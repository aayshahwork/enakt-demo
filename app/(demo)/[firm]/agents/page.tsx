"use client"

import Link from "next/link"
import { ArrowUpRight, Clock } from "lucide-react"
import { ActorAvatar, LocalModelBadge, getActor } from "@/components/demo/actor"
import { Card, PageHeader } from "@/components/demo/page"
import { AGENTS, MODEL, href } from "@/lib/demo/fixtures"
import { cn } from "@/lib/utils"

const LAST_RUN: Record<string, { text: string; tone?: "abort" | "signal" }> = {
  "marcus-assistant": { text: "Last run 18h ago · 1 blocked", tone: "abort" },
  "ops-assistant": { text: "Last run 2d ago" },
  "merge-agent": { text: "Opened MR-14 · 16h ago", tone: "signal" },
  "compliance-reviewer": { text: "Last run 17m ago" },
  "intake-agent": { text: "Interviewing · 6 scheduled", tone: "signal" },
}

export default function AgentsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <PageHeader title="Agents" description={`Agents run on ${MODEL.name} on ${MODEL.host}. They propose; people approve. Every read is scoped by policy and logged.`} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.values(AGENTS).map((a) => {
          const last = LAST_RUN[a.id]
          const actsFor = a.actsFor ? getActor(a.actsFor) : null
          return (
            <Link
              key={a.id}
              href={href(`/agents/${a.id}`)}
              className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Card className="flex h-full flex-col gap-3 p-4 transition-shadow duration-150 group-hover:shadow-md">
                <div className="flex items-start gap-3">
                  <ActorAvatar id={a.id} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-mono text-[13px] font-medium">{a.name}</span>
                      <LocalModelBadge />
                    </div>
                    <div className="text-xs text-muted-foreground">{a.role}</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="text-sm leading-5 text-muted-foreground">{a.purpose}</p>
                <div className="mt-auto flex items-center gap-2 pt-1 text-xs">
                  {actsFor ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-2 py-0.5">
                      <ActorAvatar id={actsFor.id} size="xs" /> acts for {actsFor.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-2 py-0.5 text-muted-foreground">firm-wide</span>
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
