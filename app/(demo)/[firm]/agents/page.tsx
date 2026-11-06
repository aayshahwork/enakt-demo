"use client"

import Link from "next/link"
import { ActorAvatar } from "@/components/demo/actor"
import { Card, PageHeader } from "@/components/demo/page"
import { StagePill } from "@/components/demo/status-pill"
import { HERO, OTHER_AGENTS, STAGES, href } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

export default function AgentsPage() {
  const heroStage = useDemo((s) => s.heroStage)
  const agents = [...(heroStage ? [{ ...HERO, stage: heroStage }] : []), ...OTHER_AGENTS]
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <PageHeader title="Agents" description="Requested → Scoping → Building → Ready for review → Deployed → Learning. Every agent is scoped to exactly the data it needs, enforced at the source." />
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((st) => {
          const list = agents.filter((a) => a.stage === st.id)
          return (
            <Card key={st.id} className="flex min-h-[220px] flex-col bg-muted/30 p-3">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
                {st.label} <span className="font-mono tabular">{list.length}</span>
              </div>
              <ul className="space-y-2">
                {list.map((a) => (
                  <li key={a.id}>
                    <Link href={href(`/agents/${a.id}`)} className={cn("block rounded-lg border bg-card p-2.5 shadow-sm transition-shadow hover:shadow-md", a.id === HERO.id && "border-signal/50")}>
                      <div className="text-[13px] font-medium leading-5">{a.name}</div>
                      <div className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground">{a.purpose}</div>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <ActorAvatar id={a.requesterId} size="xs" /> {a.requestId.toUpperCase()}
                        <StagePill stage={a.stage} className="ml-auto h-[18px] px-1.5 text-[10px]" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
