"use client"

import Link from "next/link"
import { ArrowUpRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ActorAvatar, ActorName } from "@/components/demo/actor"
import { Card, PageHeader } from "@/components/demo/page"
import { StagePill } from "@/components/demo/status-pill"
import { HERO, HERO_REQUEST, OTHER_AGENTS, REQUEST_FEED, href } from "@/lib/demo/fixtures"
import { relativeTime } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

export default function RequestsPage() {
  const heroStage = useDemo((s) => s.heroStage)
  const feed = [...(heroStage ? [HERO_REQUEST] : []), ...REQUEST_FEED]
  const stageOf = (agentId: string) => (agentId === HERO.id ? heroStage : OTHER_AGENTS.find((a) => a.id === agentId)?.stage)
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <PageHeader
        title="Requests"
        description="Every agent starts as a plain-language request from someone at the firm."
        actions={
          <Button asChild size="sm" variant="signal">
            <Link href={href("/requests/new")}>
              <Plus /> New request
            </Link>
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <ul className="divide-y">
          {feed.map((r) => {
            const stage = stageOf(r.agentId)
            const to = r.id === "r-7" ? href("/requests/r-7") : href(`/agents/${r.agentId}`)
            return (
              <li key={r.id}>
                <Link href={to} className={cn("flex items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/60", r.id === "r-7" && "bg-signal-soft/30")}>
                  <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground">{r.label}</span>
                  <ActorAvatar id={r.requesterId} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">&ldquo;{r.text}&rdquo;</div>
                    <div className="text-xs text-muted-foreground">
                      <ActorName id={r.requesterId} withRole className="text-xs" /> · {relativeTime(r.at)}
                    </div>
                  </div>
                  {stage && <StagePill stage={stage} />}
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
