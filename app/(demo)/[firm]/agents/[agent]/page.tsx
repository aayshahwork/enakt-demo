"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, ArrowLeft, Bot, CalendarClock, Check, CheckCircle2, Cloud, Diamond, FileText, History, Lock, Pause, Play, RotateCcw, Send, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, UnderlineTabsList, UnderlineTabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ActorAvatar, ActorName, ModelBadge, getActor } from "@/components/demo/actor"
import { Card, CardHeader, EmptyState } from "@/components/demo/page"
import { SourceIcon } from "@/components/demo/source-icon"
import { AgentStatusPill, VerdictPill } from "@/components/demo/verdict-pill"
import {
  ACCESS_LABEL,
  AGENTS,
  AGENT_POLICY,
  BRIEF,
  DEALS,
  MODEL,
  NOW,
  POLICY_BY_ID,
  RESOURCES,
  RUN_FOOTER,
  RUN_HISTORY,
  RUN_PROMPT,
  SOURCES,
  SOURCE_BY_ID,
  TRACE,
  href,
  type HistoryRow,
  type TraceKind,
  type TraceStep,
} from "@/lib/demo/fixtures"
import { absoluteTime } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

const KIND_META: Record<TraceKind, { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  scope: { icon: Diamond, cls: "text-signal" },
  read: { icon: Check, cls: "text-verified" },
  blocked: { icon: X, cls: "text-abort" },
  conflict: { icon: AlertTriangle, cls: "text-flagged" },
  done: { icon: CheckCircle2, cls: "text-verified" },
}

// ---------------------------------------------------------------------------
// Run tab (atlas-memo-agent)
// ---------------------------------------------------------------------------

function TraceRow({ step }: { step: TraceStep }) {
  const hoverStep = useDemo((s) => s.hoverStep)
  const blockedPulse = useDemo((s) => s.blockedPulse)
  const traceShown = useDemo((s) => s.traceShown)
  const m = KIND_META[step.kind]
  const Icon = m.icon
  const blocked = step.kind === "blocked"
  const pulse = blocked && blockedPulse
  const highlighted = hoverStep === step.n
  return (
    <motion.li
      id={`trace-step-${step.n}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("rounded-lg border bg-card px-3 py-2 transition-shadow duration-150", blocked && "border-abort/40", pulse && "animate-flashred", highlighted && "ring-2 ring-ring ring-offset-2 ring-offset-background")}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 w-7 shrink-0 font-mono text-[11px] text-muted-foreground tabular">[{step.n}]</span>
        <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", m.cls)} />
        <div className="min-w-0 flex-1">
          <div className={cn("text-sm font-medium leading-5", blocked && "text-abort")}>{step.title}</div>
          <div className="text-xs leading-5 text-muted-foreground">{step.detail}</div>
          <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground" title={step.path}>
            {step.path}
          </div>
          {blocked && step.policyId && (
            <AnimatePresence>
              {(blockedPulse || traceShown > step.n) && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mt-2 rounded-md border border-abort/30 bg-abort-soft px-2.5 py-2 text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-abort">
                    <Lock className="h-3 w-3" /> Denied at the Datasite group
                  </div>
                  <div className="mt-0.5 text-foreground">{POLICY_BY_ID[step.policyId].rule}</div>
                  <div className="mt-0.5 text-muted-foreground">Logged A-0124 · the agent continued without it</div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.li>
  )
}

function CitationChip({ n, label }: { n: number; label: string }) {
  const setHover = useDemo((s) => s.setHover)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(null)}
          onClick={() => document.getElementById(`trace-step-${n}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
          className="inline-flex h-5 max-w-[220px] items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-signal/40 hover:bg-signal-soft hover:text-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Citation ${label}, trace step ${n}`}
        >
          <span className="opacity-60">[{n}]</span>
          <span className="truncate">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{label} · trace step {n}</TooltipContent>
    </Tooltip>
  )
}

function BriefPane() {
  const runPhase = useDemo((s) => s.runPhase)
  const briefOrder = useDemo((s) => s.briefOrder)
  const briefShown = useDemo((s) => s.briefShown)
  const sent = useDemo((s) => s.sentForReview)
  const sendForReview = useDemo((s) => s.sendForReview)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const el = scrollRef.current
    if (el && runPhase === "playing") el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [briefShown, briefOrder, runPhase])
  const deal = DEALS.atlas

  return (
    <Card className="flex min-h-0 flex-col overflow-hidden">
      <CardHeader
        title={
          <span className="inline-flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" /> Draft · IC memo · Section 4
          </span>
        }
        action={runPhase === "done" ? <Badge variant="verified">23 files cited</Badge> : runPhase === "playing" ? <Badge variant="signal">drafting</Badge> : null}
      />
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        {briefOrder.length === 0 ? (
          <div className="flex h-full min-h-[260px] flex-col items-center justify-center p-4 text-center">
            <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileText className="h-5 w-5" />
            </span>
            <div className="text-sm font-medium">The section drafts here, in the firm template.</div>
            <div className="mt-1 max-w-xs text-xs text-muted-foreground">Every line carries a citation: file plus page or cell. Hover one to see the trace step it came from.</div>
          </div>
        ) : (
          <div className="mx-auto max-w-[560px] px-7 py-6">
            <div className="border-b pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Calloway Hill Partners · Investment Committee · Confidential</div>
              <div className="mt-2 font-serif text-[20px] font-semibold leading-7 tracking-[-0.01em]">
                {deal.name} · {deal.company}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                <span>Section 4 · Financial summary</span>
                <span>·</span>
                <span>Draft v0.1</span>
                <span>·</span>
                <span>IC {deal.ic}</span>
                <span>·</span>
                <span>template ic-memo-v4</span>
              </div>
            </div>
            <div className="space-y-5 pt-4">
              {briefOrder.map((id) => {
                const block = BRIEF.find((b) => b.id === id)
                if (!block) return null
                const shown = briefShown[id] ?? 0
                const done = shown >= block.text.length
                return (
                  <motion.div key={id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                    <div className="mb-1 flex items-center gap-2">
                      <div className="font-serif text-[15px] font-semibold">{block.heading}</div>
                      {done && block.unresolved && (
                        <Badge variant="flagged" className="gap-1">
                          <AlertTriangle className="h-3 w-3" /> Unresolved · {block.unresolved.a} vs {block.unresolved.b}
                        </Badge>
                      )}
                    </div>
                    <p className="font-serif text-[14px] leading-[1.65]">
                      {block.text.slice(0, shown)}
                      {!done && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-cursor-blink bg-foreground" />}
                    </p>
                    {done && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {block.cites.map((c) => (
                          <CitationChip key={c.label} n={c.n} label={c.label} />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>
      {runPhase === "done" && (
        <div className="flex items-center gap-2 border-t bg-muted/30 px-4 py-2.5">
          <span className="text-xs text-muted-foreground">Nothing was written to the data room. The draft lives in Enakt until the team accepts it.</span>
          <Button size="sm" variant={sent ? "outline" : "signal"} className="ml-auto" onClick={sendForReview} disabled={sent} id="send-review">
            {sent ? <Check /> : <Send />} {sent ? "Sent to deal team" : "Send to deal team for review"}
          </Button>
        </div>
      )}
    </Card>
  )
}

function RunTab() {
  const runPhase = useDemo((s) => s.runPhase)
  const traceShown = useDemo((s) => s.traceShown)
  const startRun = useDemo((s) => s.startRun)
  const pauseRun = useDemo((s) => s.pauseRun)
  const resumeRun = useDemo((s) => s.resumeRun)
  const liveAgents = useDemo((s) => s.liveAgents)
  const running = runPhase === "playing" || runPhase === "paused"
  const blockedPulse = useDemo((s) => s.blockedPulse)
  const live = liveAgents.includes("atlas-memo-agent")
  const traceRef = React.useRef<HTMLOListElement>(null)
  React.useEffect(() => {
    const el = traceRef.current
    if (!el || runPhase !== "playing") return
    const t = setTimeout(() => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }), 60)
    return () => clearTimeout(t)
  }, [traceShown, runPhase, blockedPulse])

  return (
    <div className="flex h-[calc(100vh-14rem)] min-h-[520px] flex-col">
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="rounded-lg border bg-card p-3 shadow-sm">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ActorAvatar id="ellen" size="xs" /> Ellen Marsh · prefilled from request R-3
            </div>
            <textarea value={RUN_PROMPT} readOnly rows={2} aria-label="Prompt" className="w-full resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-muted-foreground" />
            <div className="mt-2 flex items-center gap-2 border-t pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Cloud className="h-3 w-3" /> {MODEL.name}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Lock className="h-3 w-3" /> Project Atlas · read-only
              </span>
              {!live && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 rounded-full bg-flagged-soft px-2 text-[11px] text-flagged">CR-7 not merged · dry-run scope</span>
                  </TooltipTrigger>
                  <TooltipContent>Until CR-7 merges, runs replay against the proposed scope and nothing is read for real.</TooltipContent>
                </Tooltip>
              )}
              <div className="flex-1" />
              {runPhase === "idle" && (
                <Button size="sm" variant="signal" onClick={startRun} id="run-agent">
                  <Play /> Run
                </Button>
              )}
              {runPhase === "playing" && (
                <Button size="sm" variant="outline" onClick={pauseRun}>
                  <Pause /> Pause
                </Button>
              )}
              {runPhase === "paused" && (
                <Button size="sm" variant="signal" onClick={resumeRun}>
                  <Play /> Resume
                </Button>
              )}
              {runPhase === "done" && (
                <Button size="sm" variant="outline" onClick={startRun} id="run-agent">
                  <RotateCcw /> Run again
                </Button>
              )}
            </div>
          </div>

          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <CardHeader
              title="Trace"
              action={
                <span className="text-xs text-muted-foreground tabular">
                  {traceShown} of {TRACE.length} steps
                </span>
              }
            />
            <ol ref={traceRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 scrollbar-thin">
              {traceShown === 0 && (
                <li className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
                  <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-signal-soft text-signal">
                    <Bot className="h-5 w-5" />
                  </span>
                  <div className="text-sm font-medium">No run yet</div>
                  <div className="mt-1 max-w-xs text-xs text-muted-foreground">Every scope check, read, block and held value shows here with its path, as it happens.</div>
                </li>
              )}
              {TRACE.slice(0, traceShown).map((step) => (
                <TraceRow key={step.n} step={step} />
              ))}
              {running && traceShown < TRACE.length && (
                <li className="flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-signal" /> {runPhase === "paused" ? "Paused" : "Working…"}
                </li>
              )}
            </ol>
          </Card>
        </div>
        <BriefPane />
      </div>
      <div className="mt-4 flex items-center gap-2 border-t pt-3 font-mono text-[11px] text-muted-foreground">
        {runPhase === "done" ? (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-verified" /> {RUN_FOOTER}
          </>
        ) : running ? (
          <>
            <span className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-signal" /> Running in the {MODEL.tenant}… · Enakt Inc. accessed nothing
          </>
        ) : (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" /> Idle · {MODEL.name} ({MODEL.tenant}) · Enakt Inc. accessed nothing
          </>
        )}
      </div>
    </div>
  )
}

function WaitingRunTab({ agentId }: { agentId: string }) {
  const a = AGENTS[agentId]
  const status = a.status ?? "queued"
  const p = AGENT_POLICY[agentId]
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-3 shadow-sm">
        <textarea disabled rows={2} placeholder={status === "live" ? "This agent runs when a request needs scoping." : "This agent has no connection yet."} aria-label="Prompt" className="w-full resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-muted-foreground" />
        <div className="mt-2 flex items-center gap-2 border-t pt-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Cloud className="h-3 w-3" /> {MODEL.name}
          </span>
          <div className="flex-1" />
          <AgentStatusPill status={status} />
        </div>
      </div>
      <Card className="flex items-center gap-3 p-4">
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", status === "blocked" ? "bg-abort-soft text-abort" : "bg-signal-soft text-signal")}>
          {status === "blocked" ? <Lock className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-medium">{p.readable}</div>
          <div className="text-xs text-muted-foreground">{a.purpose}</div>
        </div>
        {status !== "live" && (
          <Button asChild size="sm" variant="outline" className="ml-auto">
            <Link href={href("/rollout")}>Rollout plan</Link>
          </Button>
        )}
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Scope and History
// ---------------------------------------------------------------------------

function ScopeTab({ agentId }: { agentId: string }) {
  const matrix = useDemo((s) => s.matrix)
  const liveAgents = useDemo((s) => s.liveAgents)
  const row = matrix[agentId]
  const a = AGENTS[agentId]
  const p = AGENT_POLICY[agentId]
  const scope = a.scope ?? []
  const live = liveAgents.includes(agentId) || a.status === "live"
  const policies = p.ruleIds.map((id) => POLICY_BY_ID[id])
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Access by deal" />
        <ul className="divide-y">
          {RESOURCES.map((r) => {
            const level = row?.[r.id] ?? "none"
            return (
              <li key={r.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span>{r.label}</span>
                <Badge variant={level === "none" ? "gap" : level === "own" ? "signal" : level === "propose" ? "flagged" : level === "approve" ? "verified" : "outline"}>{ACCESS_LABEL[level]}</Badge>
              </li>
            )
          })}
        </ul>
        <div className="flex items-center gap-2 border-t bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
          <Cloud className="h-3 w-3" /> {MODEL.name} · {MODEL.tenant} · {MODEL.note}
        </div>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader title={live ? "Sources it can read" : "Sources it would read"} action={<span className="text-xs text-muted-foreground tabular">{scope.length} of {SOURCES.length}</span>} />
          {scope.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">No sources. This agent reads metadata only.</div>
          ) : (
            <ul className="divide-y">
              {scope.map((id) => {
                const s = SOURCE_BY_ID[id]
                return (
                  <li key={id} className="flex items-center gap-2.5 px-4 py-2 text-sm">
                    <SourceIcon type={s.type} size={13} />
                    <span className="flex-1 truncate">{s.name}</span>
                    <span className="hidden truncate font-mono text-[10px] text-muted-foreground xl:inline">{s.enforcement}</span>
                    <VerdictPill verdict={s.verdict} icon={false} />
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
        <Card>
          <CardHeader title="Policies that apply" />
          <ul className="divide-y">
            {policies.map((pol) => (
              <li key={pol.id} className="flex items-start gap-2 px-4 py-2.5 text-sm">
                <Lock className="mt-1 h-3.5 w-3.5 shrink-0 text-merged" />
                <span>
                  <span className="font-medium">{pol.rule}.</span> <span className="text-xs text-muted-foreground">{pol.sourceLabel}, {pol.date}.</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

function HistoryTable({ rows }: { rows: HistoryRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[170px]">When</TableHead>
          <TableHead>Prompt</TableHead>
          <TableHead className="w-[90px] text-right">Cited</TableHead>
          <TableHead className="w-[100px]">Blocked</TableHead>
          <TableHead className="w-[80px] text-right">Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="text-xs text-muted-foreground tabular">{absoluteTime(r.at)}</TableCell>
            <TableCell className="text-sm">{r.prompt}</TableCell>
            <TableCell className="text-right font-mono text-xs tabular">{r.cites}</TableCell>
            <TableCell>{r.blocked > 0 ? <Badge variant="abort">{r.blocked} blocked</Badge> : <span className="text-xs text-muted-foreground">none</span>}</TableCell>
            <TableCell className="text-right font-mono text-xs text-muted-foreground tabular">{r.ms}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function HistoryTab({ agentId }: { agentId: string }) {
  const runPhase = useDemo((s) => s.runPhase)
  const base = RUN_HISTORY[agentId] ?? []
  const rows: HistoryRow[] = agentId === "atlas-memo-agent" && runPhase === "done" ? [{ id: "r-1", at: new Date(NOW.getTime() + 4 * 60_000), prompt: RUN_PROMPT, cites: 23, blocked: 1, ms: "9.4s" }, ...base] : base
  return (
    <Card>
      <CardHeader title="Run history" action={<span className="text-xs text-muted-foreground">Every run is in the audit log</span>} />
      {rows.length === 0 ? (
        <div className="p-6">
          <EmptyState icon={History} title="No runs yet" description={agentId === "atlas-memo-agent" ? "The first real run lands here once CR-7 merges and Ellen's prompt is sent." : "This agent has not been connected to any source, so it has never run."} />
        </div>
      ) : (
        <HistoryTable rows={rows} />
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AgentPage() {
  const params = useParams<{ agent: string }>()
  const agentId = params?.agent ?? ""
  const agent = AGENTS[agentId]
  const liveAgents = useDemo((s) => s.liveAgents)

  if (!agent) {
    return (
      <div className="mx-auto w-full max-w-6xl p-6">
        <EmptyState
          icon={Bot}
          title="No such agent"
          description="Agents in this workspace are listed on the Agents page."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href={href("/agents")}>
                <ArrowLeft /> All agents
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  const actsFor = agent.actsFor ? getActor(agent.actsFor) : null
  const status = liveAgents.includes(agentId) ? "live" : (agent.status ?? "queued")

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 p-6">
      <Link href={href("/agents")} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Agents
      </Link>
      <div className="flex items-start gap-3">
        <ActorAvatar id={agent.id} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display font-mono text-[20px] font-medium leading-7 tracking-[-0.01em]">{agent.name}</h1>
            <AgentStatusPill status={status} />
            <ModelBadge />
            {actsFor && (
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-2 py-0.5 text-xs">
                <ActorAvatar id={actsFor.id} size="xs" /> requested by <ActorName id={actsFor.id} withModel={false} />
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {agent.role} · {agent.purpose}
          </p>
        </div>
      </div>

      <Tabs defaultValue="run">
        <UnderlineTabsList>
          <UnderlineTabsTrigger value="run">Run</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="scope">Scope</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="history">History</UnderlineTabsTrigger>
        </UnderlineTabsList>
        <TabsContent value="run">{agent.id === "atlas-memo-agent" ? <RunTab /> : <WaitingRunTab agentId={agent.id} />}</TabsContent>
        <TabsContent value="scope">
          <ScopeTab agentId={agent.id} />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab agentId={agent.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
