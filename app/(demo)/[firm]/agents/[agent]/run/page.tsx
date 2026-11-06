"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, Check, CheckCircle2, Columns2, Lock, Mail, Play, Sparkles, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EMark } from "@/components/demo/logo"
import { Card, CardHeader } from "@/components/demo/page"
import { StagePill } from "@/components/demo/status-pill"
import { EVAL_TREND, FRESH_OUTPUT, HERO, JUNIPER, NOW, RUN_TRACE, TRAINED, TRAINED_OUTPUT, type OutputBlock, type TraceKind } from "@/lib/demo/fixtures"
import { useDemo, type OutState } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

const KIND_META: Record<TraceKind, { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  new: { icon: Mail, cls: "text-signal" },
  read: { icon: Check, cls: "text-verified" },
  blocked: { icon: X, cls: "text-abort" },
  done: { icon: CheckCircle2, cls: "text-verified" },
}

function Trace() {
  const runStep = useDemo((s) => s.runStep)
  const blockedPulse = useDemo((s) => s.blockedPulse)
  const phase = useDemo((s) => s.seq.run)
  const writeEnabled = useDemo((s) => s.writeEnabled)
  return (
    <Card className="flex min-h-0 flex-col overflow-hidden">
      <CardHeader title="Activity" action={<span className="text-xs text-muted-foreground tabular">{runStep} of {RUN_TRACE.length}</span>} />
      <ol className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 scrollbar-thin">
        {runStep === 0 && (
          <li className="flex h-full min-h-[160px] flex-col items-center justify-center text-center">
            <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-signal-soft text-signal">
              <Mail className="h-5 w-5" />
            </span>
            <div className="text-sm font-medium">Waiting for the next CIM</div>
            <div className="mt-1 max-w-xs text-xs text-muted-foreground">The agent wakes on each new email in deals@. Every read and every block shows here.</div>
          </li>
        )}
        {RUN_TRACE.slice(0, runStep).map((s) => {
          const m = KIND_META[s.kind]
          const Icon = m.icon
          const blocked = s.kind === "blocked"
          const title = s.kind === "done" && !writeEnabled ? "Screen sent to Maya's inbox" : s.title
          return (
            <motion.li key={s.n} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={cn("rounded-lg border bg-card px-3 py-2", blocked && "border-abort/40", blocked && blockedPulse && "animate-flashred")}>
              <div className="flex items-start gap-2.5">
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", m.cls)} />
                <div className="min-w-0 flex-1">
                  <div className={cn("text-sm font-medium leading-5", blocked && "text-abort")}>{title}</div>
                  <div className="text-xs leading-5 text-muted-foreground">{s.detail}</div>
                  <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground" title={s.path}>
                    {s.path}
                  </div>
                  {blocked && (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-abort/30 bg-abort-soft px-2 py-1 text-[11px] font-medium text-abort">
                      <Lock className="h-3 w-3" /> Denied at the source · the agent kept going without it
                    </div>
                  )}
                </div>
              </div>
            </motion.li>
          )
        })}
        {phase === "playing" && runStep < RUN_TRACE.length && (
          <li className="flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-signal" /> Working…
          </li>
        )}
      </ol>
    </Card>
  )
}

function Block({ b, shown, compact }: { b: OutputBlock; shown: number; compact?: boolean }) {
  const done = shown >= b.text.length
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={cn(compact && "opacity-80")}>
      <div className="mb-0.5 flex flex-wrap items-center gap-2">
        <div className="font-serif text-[15px] font-semibold">{b.heading}</div>
        {done && b.tone === "flag" && (
          <Badge variant="abort" className="gap-1">
            <AlertTriangle className="h-3 w-3" /> Above the ceiling
          </Badge>
        )}
        {done && b.tone === "unresolved" && (
          <Badge variant="flagged" className="gap-1">
            <AlertTriangle className="h-3 w-3" /> Unresolved · both kept
          </Badge>
        )}
        {done && b.tone === "match" && (
          <Badge variant="verified" className="gap-1">
            <Check className="h-3 w-3" /> Matches the partner&apos;s call
          </Badge>
        )}
      </div>
      <p className={cn("font-serif leading-[1.6]", compact ? "text-[13px]" : "text-[14px]")}>
        {b.text.slice(0, shown)}
        {!done && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-cursor-blink bg-foreground" />}
      </p>
      {done && b.cites.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {b.cites.map((c) => (
            <span key={c} className="inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              {c}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function Output({ side, state, blocks, compact }: { side: "fresh" | "trained"; state: OutState; blocks: OutputBlock[]; compact?: boolean }) {
  const words = blocks.reduce((n, b) => n + b.text.split(" ").length, 0)
  return (
    <Card className="flex min-h-0 flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <EMark size={18} />
        <span className="text-sm font-medium">{side === "fresh" ? `${HERO.name} · just deployed` : TRAINED.label}</span>
        {side === "fresh" ? <StagePill stage="deployed" /> : <StagePill stage={TRAINED.stage} />}
        <span className="ml-auto text-[11px] text-muted-foreground">{side === "trained" ? `${TRAINED.reviewed} screens reviewed · ${words} words` : `0 screens reviewed · ${words} words`}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        {state.order.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center p-4 text-center text-xs text-muted-foreground">
            <Sparkles className="mb-2 h-4 w-4" /> The one-page screen drafts here with a citation on every claim.
          </div>
        ) : (
          <div className="space-y-4 px-5 py-4">
            <div className="border-b pb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Screen · {JUNIPER.name} · {JUNIPER.company} · {JUNIPER.sector}
            </div>
            {state.order.map((id) => {
              const b = blocks.find((x) => x.id === id)
              return b ? <Block key={id} b={b} shown={state.shown[id] ?? 0} compact={compact} /> : null
            })}
          </div>
        )}
      </div>
      {side === "trained" && state.order.length > 0 && (
        <div className="border-t bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">{TRAINED.note}</div>
      )}
    </Card>
  )
}

function EvalTrend() {
  const w = 320
  const h = 90
  const xs = EVAL_TREND.map((e) => 14 + ((e.screens - 10) / 110) * (w - 28))
  const ys = EVAL_TREND.map((e) => h - 22 - ((e.agreement - 50) / 50) * (h - 34))
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ")
  return (
    <Card className="flex items-center gap-4 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">Agreement with partner decisions</div>
        <div className="text-xs text-muted-foreground">
          {EVAL_TREND[0].agreement}% at {EVAL_TREND[0].screens} screens → {EVAL_TREND[EVAL_TREND.length - 1].agreement}% at {EVAL_TREND[EVAL_TREND.length - 1].screens}. Illustrative.
        </div>
      </div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-label="Agreement with partner decisions rising over reviewed screens, illustrative">
        <line x1={14} x2={w - 14} y1={h - 22} y2={h - 22} stroke="var(--border)" />
        <path d={path} fill="none" stroke="var(--verified)" strokeWidth={2} />
        {EVAL_TREND.map((e, i) => (
          <g key={e.screens}>
            <circle cx={xs[i]} cy={ys[i]} r={3} fill="var(--verified)" />
            <text x={xs[i]} y={ys[i] - 8} textAnchor="middle" fontSize={10} fontFamily="var(--font-mono)" fill="var(--foreground)">
              {e.agreement}%
            </text>
            <text x={xs[i]} y={h - 8} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
              {e.screens}
            </text>
          </g>
        ))}
      </svg>
    </Card>
  )
}

/** Beat 8. A new CIM arrives; the fresh agent screens it; the trained version shows the difference. */
export default function RunPage() {
  const phase = useDemo((s) => s.seq.run)
  const runStep = useDemo((s) => s.runStep)
  const fresh = useDemo((s) => s.fresh)
  const trained = useDemo((s) => s.trained)
  const compare = useDemo((s) => s.compare)
  const setCompare = useDemo((s) => s.setCompare)
  const startSeq = useDemo((s) => s.startSeq)
  const deployed = useDemo((s) => s.deployStatus === "deployed")
  const addActivity = useDemo((s) => s.addActivity)
  const rec = useDemo((s) => s.rec)
  const writeEnabled = useDemo((s) => s.writeEnabled)

  React.useEffect(() => {
    if (runStep >= 5) addActivity({ id: "a-0111", at: new Date(NOW.getTime() + 6 * 60_000), actorId: "enakt", kind: "blocked", text: "CIM screener: read of the Project Atlas data room denied at the source · flagged to Ruth Abrams" })
    if (runStep >= 6) addActivity({ id: "a-0112", at: new Date(NOW.getTime() + 6 * 60_000 + 20_000), actorId: "enakt", kind: "read", text: `CIM screener screened ${JUNIPER.name} · ${writeEnabled ? "posted to DealCloud" : "sent to Maya's inbox"} · 4 sources cited` })
  }, [runStep, addActivity, writeEnabled])

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-[560px] flex-col gap-3 p-5">
      <div className="flex items-center gap-3">
        <AnimatePresence mode="wait" initial={false}>
          {runStep >= 1 ? (
            <motion.div key="cim" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-signal/40 bg-signal-soft px-3.5 py-2">
              <Mail className="h-4 w-4 shrink-0 text-signal" />
              <div className="min-w-0 flex-1 text-sm">
                <span className="font-medium">New CIM: {JUNIPER.name}</span> <span className="text-muted-foreground">· {JUNIPER.company}, {JUNIPER.sector.toLowerCase()} · from {JUNIPER.banker} · {JUNIPER.cimPages} pages</span>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">deals@ · just now</span>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border bg-card px-3.5 py-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" /> {deployed ? `${HERO.name} is live and watching deals@.` : `${HERO.name} is not deployed yet. This run replays against the dry-run scope.`}
            </motion.div>
          )}
        </AnimatePresence>
        {phase === "idle" || (phase === "done" && !rec) ? (
          <Button size="sm" variant="signal" onClick={() => startSeq("run")} id="start-run">
            <Play /> {phase === "done" ? "Run again" : "A CIM arrives"}
          </Button>
        ) : null}
        {fresh.order.length === FRESH_OUTPUT.length && !compare && !rec && (
          <Button size="sm" variant="outline" onClick={() => setCompare(true)} id="compare">
            <Columns2 /> Compare with trained
          </Button>
        )}
      </div>

      <div className={cn("grid min-h-0 flex-1 gap-3", compare ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]")}>
        <Trace />
        <Output side="fresh" state={fresh} blocks={FRESH_OUTPUT} compact={compare} />
        {compare && <Output side="trained" state={trained} blocks={TRAINED_OUTPUT} />}
      </div>
      {compare && trained.order.length === TRAINED_OUTPUT.length && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <EvalTrend />
        </motion.div>
      )}
    </div>
  )
}
