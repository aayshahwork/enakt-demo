"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, ArrowRight, Bot, Check, Cloud, Eye, FileText, GitPullRequest, Inbox, Lock, Server, ShieldCheck, Wrench, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ActorAvatar, ActorName } from "@/components/demo/actor"
import { Card, CardHeader, PageHeader, Stat } from "@/components/demo/page"
import { SourceIcon } from "@/components/demo/source-icon"
import { Truncate } from "@/components/demo/truncate"
import { AgentStatusPill, VerdictPill } from "@/components/demo/verdict-pill"
import { AGENTS, AGENT_ORDER, AUDIT, CR, DEPLOYMENT, METER, MODEL, REVENUE, SOURCES, SOURCE_BY_ID, href, type AgentStatus, type AuditKind } from "@/lib/demo/fixtures"
import { relativeTime } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

const KIND_ICON: Record<AuditKind, { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  blocked: { icon: X, cls: "text-abort" },
  connect: { icon: GitPullRequest, cls: "text-signal" },
  approve: { icon: Check, cls: "text-verified" },
  policy: { icon: ShieldCheck, cls: "text-merged" },
  read: { icon: Eye, cls: "text-muted-foreground" },
  request: { icon: Inbox, cls: "text-signal" },
  task: { icon: Check, cls: "text-verified" },
  system: { icon: Server, cls: "text-muted-foreground" },
}

/** This week, by owner. Approvals and the readiness tasks. */
const WEEK: { owner: string; items: { id: string; text: string; due: string }[] }[] = [
  { owner: "ellen", items: [{ id: "approve-ellen", text: "Approve CR-7 as deal partner", due: "Nov 6" }] },
  {
    owner: "grace",
    items: [
      { id: "approve-grace", text: "Approve CR-7 as CCO", due: "Nov 6" },
      { id: "lp-decide", text: "Decide the lp-letter-agent request", due: "Nov 7" },
      { id: "kpi", text: "Collect September packs from 2 companies", due: "Nov 14" },
    ],
  },
  {
    owner: "nina",
    items: [
      { id: "revenue", text: "Resolve TTM revenue: CIM p.14 vs Monthly P&L F42", due: "Nov 12" },
      { id: "v6", text: "Retire the v6 link in the memo draft", due: "Nov 8" },
    ],
  },
  { owner: "tom", items: [{ id: "datasite", text: "Confirm atlas-deal-team group for atlas-memo-agent", due: "Nov 6" }] },
  { owner: "dana", items: [{ id: "outlook", text: "Decide whether to connect Outlook metadata", due: "Nov 18" }] },
]

export default function HomePage() {
  const progress = useDemo((s) => s.progress)
  const liveAgents = useDemo((s) => s.liveAgents)
  const approvals = useDemo((s) => s.approvals)
  const crStatus = useDemo((s) => s.crStatus)
  const extraAudit = useDemo((s) => s.extraAudit)

  const activity = React.useMemo(() => [...extraAudit, ...AUDIT].slice(0, 8), [extraAudit])
  const after = progress >= METER.after
  const statusOf = (id: string): AgentStatus => (liveAgents.includes(id) ? "live" : (AGENTS[id].status ?? "queued"))
  const counts = AGENT_ORDER.filter((id) => AGENTS[id].requestId).reduce(
    (acc, id) => {
      acc[statusOf(id)]++
      return acc
    },
    { live: 0, build: 0, queued: 0, blocked: 0 } as Record<AgentStatus, number>,
  )
  const sourcesReady = SOURCES.filter((s) => s.verdict === "ready").length
  const doneItem = (id: string) => (id === "approve-ellen" && approvals.includes("ellen")) || (id === "approve-grace" && approvals.includes("grace"))

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <PageHeader title="Home" description="Calloway Hill Partners · what the first agent needs, what is ready, and who owns each gap." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Firm AI-ready" value={`${Math.round(progress)}%`} hint={after ? "1 agent live · 4 sources connected" : "0 agents live · Day 12 of 30"} accent={after ? "var(--verified)" : "var(--signal)"} />
        <Stat label="Agents" value={counts.live} hint={`live · ${counts.build} in build · ${counts.queued + counts.blocked} queued`} />
        <Stat label="Sources scanned" value={SOURCES.length} hint={`${sourcesReady} ready · 0 rows read`} />
        <Stat label="Approvals open" value={crStatus === "merged" ? 0 : CR.approvers.length - approvals.length} hint={crStatus === "merged" ? "CR-7 merged" : "CR-7 · deal partner and CCO"} accent={crStatus === "merged" ? "var(--verified)" : "var(--flagged)"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                Needs attention <span className="rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground tabular">3</span>
              </span>
            }
            action={
              <Link href={href("/readiness")} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                Open Readiness
              </Link>
            }
          />
          <ul className="divide-y">
            <li>
              <Link href={href("/readiness?source=atlas-dataroom")} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/60">
                <span className="inline-flex h-[19.6px] w-[19.6px] shrink-0 items-center justify-center rounded-md bg-abort-soft text-abort">
                  <AlertTriangle className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">Northline TTM revenue does not tie</div>
                  <Truncate className="text-xs text-muted-foreground" text={`${REVENUE.a.value} in the CIM (p.14) vs ${REVENUE.b.value} in the monthly P&L (F42). Held for Nina Alvarez.`}>
                    {REVENUE.a.value} in the CIM (p.14) vs {REVENUE.b.value} in the monthly P&L (F42). Held for Nina Alvarez.
                  </Truncate>
                </div>
                <VerdictPill verdict="conflict" />
              </Link>
            </li>
            <li>
              <Link href={href("/readiness?source=atlas-model-v6")} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/60">
                <SourceIcon type="sharepoint" size={14} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{SOURCE_BY_ID["atlas-model-v6"].name}</div>
                  <Truncate className="text-xs text-muted-foreground" text={SOURCE_BY_ID["atlas-model-v6"].reason}>
                    {SOURCE_BY_ID["atlas-model-v6"].reason}
                  </Truncate>
                </div>
                <VerdictPill verdict="attention" label="Stale model" icon={false} className="gap-1">
                </VerdictPill>
              </Link>
            </li>
            <li>
              <Link href={href("/rollout")} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/60">
                <span className="inline-flex h-[19.6px] w-[19.6px] shrink-0 items-center justify-center rounded-md bg-abort-soft text-abort">
                  <Lock className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">R-5 lp-letter-agent needs the LP database</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    Red source · awaiting <ActorAvatar id="grace" size="xs" /> Grace Liu (CCO)
                  </div>
                </div>
                <AgentStatusPill status="blocked" />
              </Link>
            </li>
          </ul>
        </Card>

        <Card>
          <CardHeader title="This week" action={<span className="text-xs text-muted-foreground">by owner</span>} />
          <div className="divide-y">
            {WEEK.map((g) => (
              <div key={g.owner} className="px-4 py-3">
                <div className="mb-1.5 flex items-center gap-2 text-xs">
                  <ActorAvatar id={g.owner} size="xs" />
                  <ActorName id={g.owner} withRole className="text-xs" />
                </div>
                <ul className="space-y-1">
                  {g.items.map((it) => {
                    const done = doneItem(it.id)
                    return (
                      <li key={it.id} className="flex items-center gap-2 pl-7 text-sm">
                        {done ? <Check className="h-3.5 w-3.5 shrink-0 text-verified" /> : <span className="h-3.5 w-3.5 shrink-0 rounded-full border" />}
                        <span className={cn("min-w-0 flex-1 truncate", done && "text-muted-foreground line-through")}>{it.text}</span>
                        <span className="shrink-0 text-xs text-muted-foreground tabular">due {it.due}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Agents"
          action={
            <Link href={href("/agents")} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              All agents
            </Link>
          }
        />
        <ul className="grid divide-y md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4 xl:divide-y-0">
          {AGENT_ORDER.map((id) => {
            const a = AGENTS[id]
            const st = statusOf(id)
            return (
              <li key={id}>
                <Link href={href(`/agents/${id}`)} className="flex h-full flex-col gap-1.5 px-4 py-3 transition-colors hover:bg-accent/60">
                  <div className="flex items-center gap-2">
                    <ActorAvatar id={id} size="sm" />
                    <span className="min-w-0 flex-1 truncate font-mono text-[12px] font-medium">{a.name}</span>
                    <AgentStatusPill status={st} />
                  </div>
                  <div className="line-clamp-2 text-xs leading-4 text-muted-foreground">{a.role} · {a.scope?.length ?? 0} sources in scope</div>
                </Link>
              </li>
            )
          })}
        </ul>
      </Card>

      <Card>
        <CardHeader
          title="Recent activity"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href={href("/audit")}>
                View audit log <ArrowRight />
              </Link>
            </Button>
          }
        />
        <ul className="divide-y">
          {activity.map((a) => {
            const k = KIND_ICON[a.kind]
            const Icon = k.icon
            const row = (
              <>
                <ActorAvatar id={a.actorId} size="sm" />
                <span className="min-w-0 flex-1 text-sm">
                  <ActorName id={a.actorId} /> <span className={cn(a.kind === "blocked" ? "text-abort" : "text-muted-foreground")}>{a.text}</span>
                </span>
                <Icon className={cn("h-3.5 w-3.5 shrink-0", k.cls)} />
                <span className="w-16 shrink-0 text-right text-xs text-muted-foreground tabular">{relativeTime(a.at)}</span>
              </>
            )
            return (
              <li key={a.id}>
                {a.href ? (
                  <Link href={a.href} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/60">
                    {row}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2.5">{row}</div>
                )}
              </li>
            )
          })}
        </ul>
      </Card>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
        <Cloud className="h-3.5 w-3.5 text-verified" />
        <span className="font-medium text-foreground">Runs in Calloway Hill&apos;s Azure tenant</span>
        <span>·</span>
        <span>{MODEL.name}, {MODEL.note}</span>
        <span>·</span>
        <span>Enakt Inc. accounts: {DEPLOYMENT.enaktAccounts}</span>
        <span>·</span>
        <span>installed {DEPLOYMENT.installedOn.replace(", 2026", "")} by {DEPLOYMENT.installedBy}</span>
        <Link href={href("/settings?tab=deployment")} className="ml-auto inline-flex items-center gap-1 font-medium text-signal underline-offset-4 hover:underline">
          Deployment details <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <span className="sr-only">
        <Bot /> <FileText /> <Wrench />
      </span>
    </div>
  )
}
