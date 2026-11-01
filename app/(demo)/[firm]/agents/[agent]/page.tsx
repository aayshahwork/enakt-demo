"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, ArrowLeft, Bot, CalendarClock, Check, CheckCircle2, Cpu, Diamond, FileText, Lock, Pause, Play, RotateCcw, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, UnderlineTabsList, UnderlineTabsTrigger } from "@/components/ui/tabs"
import { ActorAvatar, ActorName, LocalModelBadge, getActor } from "@/components/demo/actor"
import { Card, CardHeader, EmptyState } from "@/components/demo/page"
import { SourceIcon } from "@/components/demo/source-icon"
import { VerdictPill } from "@/components/demo/verdict-pill"
import {
  ACCESS_LABEL,
  AGENTS,
  BRIEF,
  MODEL,
  POLICIES,
  POLICY_BY_ID,
  RESOURCES,
  RUN_FOOTER,
  RUN_HISTORY,
  RUN_PROMPT,
  SOURCES,
  SOURCE_BY_ID,
  TRACE,
  VIEW_SCOPE,
  href,
  type SourceId,
  type TraceKind,
  type TraceStep,
} from "@/lib/demo/fixtures"
import { absoluteTime } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

const KIND_META: Record<TraceKind, { icon: React.ComponentType<{ className?: string }>; cls: string; label: string }> = {
  scope: { icon: Diamond, cls: "text-signal", label: "scope" },
  read: { icon: Check, cls: "text-verified", label: "read" },
  blocked: { icon: X, cls: "text-abort", label: "blocked" },
  conflict: { icon: AlertTriangle, cls: "text-flagged", label: "conflict" },
  done: { icon: CheckCircle2, cls: "text-verified", label: "done" },
}

// ---------------------------------------------------------------------------
// Run tab (marcus-assistant)
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
      className={cn(
        "rounded-lg border bg-card px-3 py-2 transition-shadow duration-150",
        blocked && "border-abort/40",
        pulse && "animate-flashred",
        highlighted && "ring-2 ring-ring ring-offset-2 ring-offset-background",
      )}
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
                    <Lock className="h-3 w-3" /> Blocked by policy
                  </div>
                  <div className="mt-0.5 text-foreground">{POLICY_BY_ID[step.policyId].rule}</div>
                  <div className="mt-0.5 text-muted-foreground">Enforced at data layer · logged A-2031</div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.li>
  )
}

function CitationChip({ n }: { n: number }) {
  const setHover = useDemo((s) => s.setHover)
  return (
    <button
      type="button"
      onMouseEnter={() => setHover(n)}
      onMouseLeave={() => setHover(null)}
      onClick={() => document.getElementById(`trace-step-${n}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
      className="inline-flex h-5 items-center rounded border bg-muted px-1 font-mono text-[10px] text-muted-foreground transition-colors hover:border-signal/40 hover:bg-signal-soft hover:text-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Citation: trace step ${n}`}
    >
      [{n}]
    </button>
  )
}

function BriefPane() {
  const runPhase = useDemo((s) => s.runPhase)
  const briefOrder = useDemo((s) => s.briefOrder)
  const briefShown = useDemo((s) => s.briefShown)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [briefShown, briefOrder])

  return (
    <Card className="flex min-h-0 flex-col overflow-hidden">
      <CardHeader
        title={
          <span className="inline-flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" /> Brief · Patel household · Thursday review
          </span>
        }
        action={runPhase === "done" ? <Badge variant="verified">5 citations</Badge> : runPhase === "playing" ? <Badge variant="signal">streaming</Badge> : null}
      />
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin">
        {briefOrder.length === 0 && (
          <div className="flex h-full min-h-[260px] flex-col items-center justify-center text-center">
            <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileText className="h-5 w-5" />
            </span>
            <div className="text-sm font-medium">The brief streams here with a citation for every claim.</div>
            <div className="mt-1 max-w-xs text-xs text-muted-foreground">Each chip links to the trace step it came from. Gaps are typed, never filled in.</div>
          </div>
        )}
        {briefOrder.map((id) => {
          const block = BRIEF.find((b) => b.id === id)
          if (!block) return null
          const shown = briefShown[id] ?? 0
          const done = shown >= block.text.length
          return (
            <motion.div key={id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
              {block.heading && <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{block.heading}</div>}
              <p className="text-sm leading-6">
                {block.text.slice(0, shown)}
                {!done && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-cursor-blink bg-foreground" />}
                {done && (
                  <span className="ml-1.5 inline-flex gap-1 align-middle">
                    {block.cites.map((n) => (
                      <CitationChip key={n} n={n} />
                    ))}
                  </span>
                )}
              </p>
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}

function RunTab() {
  const runPhase = useDemo((s) => s.runPhase)
  const traceShown = useDemo((s) => s.traceShown)
  const startRun = useDemo((s) => s.startRun)
  const pauseRun = useDemo((s) => s.pauseRun)
  const resumeRun = useDemo((s) => s.resumeRun)
  const running = runPhase === "playing" || runPhase === "paused"
  const blockedPulse = useDemo((s) => s.blockedPulse)
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
            <textarea
              value={RUN_PROMPT}
              readOnly
              rows={2}
              aria-label="Prompt"
              className="w-full resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-muted-foreground"
            />
            <div className="mt-2 flex items-center gap-2 border-t pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Cpu className="h-3 w-3" /> {MODEL.name} · {MODEL.host}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Lock className="h-3 w-3" /> scoped to Marcus Lee&apos;s book
              </span>
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
                  <div className="mt-1 max-w-xs text-xs text-muted-foreground">Every read, block and conflict shows here with its source path, as it happens.</div>
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
            <span className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-signal" /> Running on {MODEL.host}… · 0 bytes left the network
          </>
        ) : (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" /> Idle · nothing has left the network
          </>
        )}
      </div>
    </div>
  )
}

function ScheduledRunTab({ agentId }: { agentId: string }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-3 shadow-sm">
        <textarea disabled rows={2} placeholder="This agent runs on a schedule." aria-label="Prompt" className="w-full resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-muted-foreground" />
        <div className="mt-2 flex items-center gap-2 border-t pt-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Cpu className="h-3 w-3" /> {MODEL.name} · {MODEL.host}
          </span>
          <div className="flex-1" />
          <Badge variant="gap" className="gap-1">
            <CalendarClock className="h-3 w-3" /> Scheduled
          </Badge>
        </div>
      </div>
      <Card className="flex items-center gap-3 p-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal-soft text-signal">
          <CalendarClock className="h-4 w-4" />
        </span>
        <div>
          <div className="text-sm font-medium">Next scheduled run: Nov 1, 02:00 · {MODEL.host}</div>
          <div className="text-xs text-muted-foreground">
            {AGENTS[agentId]?.purpose} Output goes to the owner for approval.
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader title="Recent runs" />
        <HistoryTable rows={RUN_HISTORY.slice(0, 3)} />
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Scope and History
// ---------------------------------------------------------------------------

function ScopeTab({ agentId }: { agentId: string }) {
  const matrix = useDemo((s) => s.matrix)
  const row = matrix[agentId]
  const visibleIds: SourceId[] =
    agentId === "marcus-assistant"
      ? (VIEW_SCOPE["marcus-assistant"] as SourceId[])
      : SOURCES.filter((s) => s.resource && row && row[s.resource] !== "none").map((s) => s.id)
  const policies = POLICIES.filter((p) => p.governs.some((g) => visibleIds.includes(g as SourceId)) || (agentId === "marcus-assistant" && p.id === "advisor-scope") || p.governs.includes("brain"))
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Access by resource" />
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
          <Cpu className="h-3 w-3" /> Model: {MODEL.name} · {MODEL.host}, {MODEL.rack} · cloud models disabled by policy
        </div>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader title="Sources it can see" action={<span className="text-xs text-muted-foreground tabular">{visibleIds.length} of {SOURCES.length}</span>} />
          {visibleIds.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">No sources. This agent has no data access.</div>
          ) : (
            <ul className="divide-y">
              {visibleIds.map((id) => {
                const s = SOURCE_BY_ID[id]
                return (
                  <li key={id} className="flex items-center gap-2.5 px-4 py-2 text-sm">
                    <SourceIcon type={s.type} size={13} />
                    <span className="flex-1 truncate">{s.name}</span>
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
            {policies.map((p) => (
              <li key={p.id} className="flex items-start gap-2 px-4 py-2.5 text-sm">
                <Lock className="mt-1 h-3.5 w-3.5 shrink-0 text-merged" />
                <span>
                  <span className="font-medium">{p.rule}.</span> <span className="text-xs text-muted-foreground">{p.sourceLabel}, {p.date}.</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

type HistoryRow = { id: string; at: Date; prompt: string; cites: number; blocked: number; ms: string }

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
  const rows: HistoryRow[] = agentId === "marcus-assistant" && runPhase === "done" ? [{ id: "r-119", at: new Date("2026-10-31T10:16:00-04:00"), prompt: RUN_PROMPT, cites: 5, blocked: 1, ms: "8.2s" }, ...RUN_HISTORY] : RUN_HISTORY
  return (
    <Card>
      <CardHeader title="Run history" action={<span className="text-xs text-muted-foreground">Every run is in the audit log</span>} />
      <HistoryTable rows={rows} />
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
            <LocalModelBadge />
            {actsFor && (
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-2 py-0.5 text-xs">
                <ActorAvatar id={actsFor.id} size="xs" /> acts for <ActorName id={actsFor.id} withModel={false} />
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
        <TabsContent value="run">{agent.id === "marcus-assistant" ? <RunTab /> : <ScheduledRunTab agentId={agent.id} />}</TabsContent>
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
