"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight, Check, Circle, Lock } from "lucide-react"
import { ActorAvatar } from "@/components/demo/actor"
import { Card, CardHeader, PageHeader, Stat } from "@/components/demo/page"
import { AgentStatusPill } from "@/components/demo/verdict-pill"
import { AGENTS, DEPLOYMENT, MILESTONES, REQUESTS, href } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

function Timeline() {
  const milestonesDone = useDemo((s) => s.milestonesDone)
  const liveAgents = useDemo((s) => s.liveAgents)
  const total = DEPLOYMENT.totalDays
  const today = DEPLOYMENT.day
  const pct = (d: number) => ((d - 1) / (total - 1)) * 100
  const isDone = (id: string, done: boolean) => done || milestonesDone.includes(id)
  const d19Ahead = liveAgents.length > 0
  return (
    <Card className="overflow-hidden">
      <CardHeader title="30-day plan" action={<span className="text-xs text-muted-foreground">Installed {DEPLOYMENT.installedOn} · today is Day {today}</span>} />
      <div className="px-8 pb-4 pt-[76px]">
        <div className="relative h-1.5 rounded-full bg-muted">
          <motion.div className="absolute inset-y-0 left-0 rounded-full bg-signal" initial={{ width: 0 }} animate={{ width: `${pct(today)}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
          <div className="absolute -top-7 -translate-x-1/2 whitespace-nowrap rounded-full border border-signal/40 bg-signal-soft px-2 text-[10px] font-medium text-signal" style={{ left: `${pct(today)}%` }}>
            Day {today} · today
          </div>
          {MILESTONES.map((m) => {
            const done = isDone(m.id, m.done)
            const ahead = m.id === "d19" && d19Ahead
            return (
              <div key={m.id} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${pct(m.day)}%` }}>
                <motion.span
                  initial={false}
                  animate={{ scale: done ? [1, 1.25, 1] : 1 }}
                  transition={{ duration: 0.4 }}
                  className={cn("flex h-6 w-6 items-center justify-center rounded-full border-2 bg-card", done ? "border-verified text-verified" : ahead ? "border-signal text-signal" : m.day <= today ? "border-signal text-signal" : "border-border text-muted-foreground")}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-2 w-2 fill-current" />}
                </motion.span>
                <div className={cn("absolute left-1/2 w-[130px] -translate-x-1/2 text-center", m.side === "top" ? "bottom-8" : "top-8", m.day === 1 && "left-0 translate-x-0 text-left", m.day === 30 && "left-auto right-0 translate-x-0 text-right")}>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    Day {m.day} · {m.date}
                  </div>
                  <div className={cn("text-[12px] font-medium leading-4", done ? "text-verified" : m.day > today && !ahead ? "text-muted-foreground" : "")}>{m.label}</div>
                  {m.gate && !done && <div className="mt-0.5 text-[10px] text-muted-foreground">{ahead ? "ahead of plan" : m.gate}</div>}
                </div>
              </div>
            )
          })}
        </div>
        <div className="h-16" />
      </div>
      <div className="flex items-center gap-2 border-t bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        Gates: CR-7 needs the deal partner and the CCO. The first agent is live the moment it merges; the plan allowed until Day 19.
      </div>
    </Card>
  )
}

export default function RolloutPage() {
  const milestonesDone = useDemo((s) => s.milestonesDone)
  const liveAgents = useDemo((s) => s.liveAgents)
  const done = MILESTONES.filter((m) => m.done || milestonesDone.includes(m.id)).length
  const queue = REQUESTS.filter((r) => r.status === "queued" || r.status === "blocked")
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <PageHeader title="Rollout" description="First agent on real deal data within 30 days, inside the firm's own tenant. Milestones check off as the gates clear." />
      <div className="grid grid-cols-4 gap-4">
        <Stat label="Day" value={DEPLOYMENT.day} hint={`of ${DEPLOYMENT.totalDays}`} accent="var(--signal)" />
        <Stat label="Milestones" value={done} hint={`of ${MILESTONES.length} done`} accent="var(--verified)" />
        <Stat label="Agents live" value={liveAgents.length} hint={liveAgents.length ? "atlas-memo-agent" : "CR-7 pending"} accent={liveAgents.length ? "var(--verified)" : undefined} />
        <Stat label="In queue" value={queue.length} hint="1 yellow · 1 red" accent="var(--flagged)" />
      </div>
      <Timeline />
      <Card>
        <CardHeader title="Request queue" action={<span className="text-xs text-muted-foreground">next agents, in order</span>} />
        <ul className="divide-y">
          {queue.map((r) => {
            const a = r.agentId ? AGENTS[r.agentId] : null
            const blocked = r.status === "blocked"
            return (
              <li key={r.id}>
                <Link href={a ? href(`/agents/${a.id}`) : href("/requests")} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60">
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", blocked ? "bg-abort-soft text-abort" : "bg-flagged-soft text-flagged")}>{blocked ? <Lock className="h-4 w-4" /> : <Circle className="h-3 w-3 fill-current" />}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{r.label}</span>
                      {a && <span className="truncate font-mono text-[13px] font-medium">{a.name}</span>}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {blocked ? "needs red data · awaiting CCO decision on the LP database" : "waiting on KPI cleanup · 2 September packs missing"} · requested by {a?.actsFor ? AGENTS[a.id].actsFor : ""}
                      {a?.actsFor && <ActorAvatar id={a.actsFor} size="xs" className="ml-1 inline-flex align-middle" />}
                    </div>
                  </div>
                  <AgentStatusPill status={blocked ? "blocked" : "queued"} />
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
