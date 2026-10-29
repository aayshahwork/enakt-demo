"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Bot, Check, Play, RotateCcw, Shield, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, PageHeader } from "@/components/demo/page"
import { ActorAvatar } from "@/components/demo/actor"
import { SourceIcon } from "@/components/demo/source-icon"
import { VerdictDot } from "@/components/demo/verdict-pill"
import { INTAKE_CONNECTION, INTAKE_END_STATE, INTAKE_TURNS, SOURCE_BY_SLUG, type Source } from "@/lib/demo/fixtures"
import { streamText, wait, TIMING } from "@/lib/demo/sim"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

type TurnState = { id: string; partial: string; done: boolean }

export default function IntakePage() {
  const { state, dispatch } = useDemo()
  const [running, setRunning] = React.useState(false)
  const [turns, setTurns] = React.useState<TurnState[]>(() =>
    state.intakeRun ? INTAKE_TURNS.map((t) => ({ id: t.id, partial: t.answer, done: true })) : [],
  )
  const [revealed, setRevealed] = React.useState<string[]>(() => (state.intakeRun ? INTAKE_TURNS.flatMap((t) => t.reveals) : []))
  const [finished, setFinished] = React.useState(state.intakeRun)
  const abort = React.useRef<AbortController | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Reflect external reset (Shift+R) while on this page.
  React.useEffect(() => {
    if (!state.intakeRun && !running) {
      setTurns([])
      setRevealed([])
      setFinished(false)
    }
  }, [state.intakeRun, running])

  React.useEffect(() => () => abort.current?.abort(), [])

  React.useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns, finished])

  const run = async () => {
    if (running) return
    abort.current?.abort()
    const ac = new AbortController()
    abort.current = ac
    setRunning(true)
    setTurns([])
    setRevealed([])
    setFinished(false)
    try {
      for (const t of INTAKE_TURNS) {
        setTurns((prev) => [...prev, { id: t.id, partial: "", done: false }])
        await wait(TIMING.intakeThinkMs, ac.signal)
        await streamText(t.answer, (p) => setTurns((prev) => prev.map((x) => (x.id === t.id ? { ...x, partial: p } : x))), { signal: ac.signal })
        setTurns((prev) => prev.map((x) => (x.id === t.id ? { ...x, done: true } : x)))
        for (const slug of t.reveals) {
          setRevealed((prev) => (prev.includes(slug) ? prev : [...prev, slug]))
          await wait(140, ac.signal)
        }
        await wait(TIMING.intakeBetweenMs, ac.signal)
      }
      await wait(300, ac.signal)
      setFinished(true)
      dispatch({ type: "intake:done" })
    } catch {
      /* aborted */
    } finally {
      setRunning(false)
    }
  }

  const reset = () => {
    abort.current?.abort()
    setRunning(false)
    setTurns([])
    setRevealed([])
    setFinished(false)
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_400px]">
      <div className="flex min-h-0 flex-col">
        <PageHeader
          title="Intake"
          description="Enakt asks where the work lives. It reads names, owners, and timestamps. It never reads a row."
          actions={
            <>
              {(finished || turns.length > 0) && !running && (
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RotateCcw /> Clear
                </Button>
              )}
              <Button onClick={run} disabled={running} variant="signal" size="sm" id="run-intake">
                <Play /> {running ? "Running intake…" : finished ? "Run again" : "Run intake"}
              </Button>
            </>
          }
        />

        <Card className="mt-5 flex min-h-[520px] flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-verified opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-verified" />
            </span>
            <span className="font-medium">{INTAKE_CONNECTION}</span>
            <span className="ml-auto inline-flex items-center gap-1 text-muted-foreground">
              <Shield className="h-3 w-3" /> Scope: schema, owners, timestamps
            </span>
          </div>

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 scrollbar-thin">
            {turns.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-signal-soft text-signal">
                  <Bot className="h-5 w-5" />
                </span>
                <div className="text-sm font-medium">No intake session yet</div>
                <div className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Run intake to ask five questions. Dana&apos;s Claude answers from metadata it can already see; Dana answers the rest.
                </div>
              </div>
            )}
            {turns.map((t, i) => {
              const spec = INTAKE_TURNS[i]
              const byClaude = spec.answeredBy === "claude"
              return (
                <div key={t.id} className="space-y-3">
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-start gap-3">
                    <ActorAvatar id="intake-agent" size="md" />
                    <div className="min-w-0">
                      <div className="mb-1 text-xs text-muted-foreground">
                        <span className="font-mono text-foreground">intake-agent</span> · Question {i + 1} of {INTAKE_TURNS.length}
                      </div>
                      <div className="text-sm font-medium">{spec.question}</div>
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.1 }} className="ml-11 flex items-start gap-3">
                    <div className={cn("min-w-0 flex-1 rounded-lg border px-4 py-3", byClaude ? "border-signal/20 bg-signal-soft/50" : "bg-card")}>
                      <div className="mb-1.5 flex items-center gap-2 text-xs">
                        {byClaude ? (
                          <Badge variant="signal" className="gap-1">
                            <Bot className="h-3 w-3" /> Answered by Dana&apos;s Claude
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <User className="h-3 w-3" /> Answered by Dana Ruiz
                          </Badge>
                        )}
                        {t.done && <Check className="h-3.5 w-3.5 text-verified" />}
                      </div>
                      <p className="text-sm leading-6">
                        {t.partial}
                        {!t.done && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-cursor-blink bg-foreground" />}
                      </p>
                      {t.done && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {spec.reveals.map((slug) => {
                            const s = SOURCE_BY_SLUG[slug]
                            return (
                              <motion.span key={slug} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.15 }}>
                                <Badge variant="outline" className="gap-1 bg-card">
                                  <SourceIcon type={s.type} size={10} /> {s.name}
                                </Badge>
                              </motion.span>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )
            })}
            <AnimatePresence>
              {finished && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="ml-11 flex items-center justify-between rounded-lg border border-verified/30 bg-verified-soft px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-verified">
                    <Check className="h-4 w-4" /> {INTAKE_END_STATE}
                  </div>
                  <Button asChild size="sm" variant="verified">
                    <Link href="/northfield/map">
                      Open the map <ArrowRight />
                    </Link>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      <MiniMap revealed={revealed} finished={finished} />
    </div>
  )
}

const RING: Record<string, { x: number; y: number }> = {
  "salesforce-crm": { x: 26, y: 20 },
  "onboarding-tracker": { x: 50, y: 8 },
  "client-contacts-2023": { x: 74, y: 20 },
  "schwab-custodian-feed": { x: 22, y: 42 },
  "aum-rollup": { x: 78, y: 42 },
  "portfolio-db": { x: 50, y: 92 },
  "quickbooks-billing": { x: 24, y: 64 },
  "advisor-compensation": { x: 76, y: 64 },
  "prospect-pipeline": { x: 26, y: 82 },
  "compliance-log": { x: 74, y: 82 },
}

function MiniMap({ revealed, finished }: { revealed: string[]; finished: boolean }) {
  const sources = revealed.map((s) => SOURCE_BY_SLUG[s]).filter(Boolean) as Source[]
  return (
    <Card className="flex min-h-[520px] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="text-sm font-medium">Live map</div>
        <div className="font-mono text-xs text-muted-foreground tabular">
          <span className={cn("text-foreground", finished && "text-verified")}>{sources.length}</span> / 10 sources
        </div>
      </div>
      <div className="relative flex-1 bg-[radial-gradient(color-mix(in_srgb,var(--foreground)_8%,transparent)_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="absolute left-1/2 top-1/2 z-10 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl border-2 border-dashed border-signal/40 bg-card text-center shadow-sm">
          <span className="text-[10px] font-medium leading-[12px] text-signal">Unified<br />Client<br />Record</span>
        </div>
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          {sources.map((s) => {
            const p = RING[s.slug]
            return (
              <motion.line
                key={s.slug}
                x1={`${p.x}%`}
                y1={`${p.y}%`}
                x2="50%"
                y2="50%"
                stroke="var(--border)"
                strokeWidth={1}
                strokeDasharray="3 3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )
          })}
        </svg>
        <AnimatePresence>
          {sources.map((s) => {
            const p = RING[s.slug]
            return (
              <motion.div
                key={s.slug}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                className="absolute z-10 flex items-center gap-1.5 whitespace-nowrap rounded-md border bg-card px-2 py-1 shadow-sm"
                style={{ left: `${p.x}%`, top: `${p.y}%`, x: "-50%", y: "-50%" }}
              >
                <SourceIcon type={s.type} size={12} />
                <span className="max-w-[120px] truncate text-[11px] font-medium">{s.name}</span>
                <VerdictDot verdict={s.verdict} />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
      <div className="border-t px-4 py-2.5 text-xs text-muted-foreground">
        {finished ? (
          <span className="text-verified">Mapped by metadata only. Enakt has not opened a single row.</span>
        ) : sources.length === 0 ? (
          "Sources appear here as they are discovered."
        ) : (
          `${sources.length} discovered · ${sources.filter((s) => s.verdict === "ready").length} look ready`
        )}
      </div>
    </Card>
  )
}
