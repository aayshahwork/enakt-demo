"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Ban, Check, Database, FastForward, HelpCircle, Pause, Play, ShieldCheck, Sparkles, UserRound, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ActorAvatar, getActor } from "@/components/demo/actor"
import { EMark } from "@/components/demo/logo"
import { RequestStatusPill } from "@/components/demo/verdict-pill"
import { MODEL, PLAN_COLUMN_LABEL, PLAN_ITEMS, REQUEST, SCAN, href, type PlanColumn } from "@/lib/demo/fixtures"
import { absoluteTime, fmtInt, relativeTime } from "@/lib/demo/format"
import { BEATS, REQUEST_BANNER, type Chip, type TranscriptEntry } from "@/lib/demo/script"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

/** Chip tones follow the pill token set: source green, cleanup yellow, policy purple, question red. */
const CHIP_META: Record<Chip["kind"], { label: string; icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  source: { label: "Source", icon: Database, cls: "border-verified/30 bg-verified-soft text-verified" },
  cleanup: { label: "Cleanup", icon: Wrench, cls: "border-flagged/30 bg-flagged-soft text-flagged" },
  policy: { label: "Policy", icon: ShieldCheck, cls: "border-merged/30 bg-merged-soft text-merged" },
  question: { label: "Open question", icon: HelpCircle, cls: "border-abort/40 bg-abort-soft text-abort" },
}

const COLUMNS: { id: PlanColumn; icon: React.ComponentType<{ className?: string }>; cls: string }[] = [
  { id: "needs", icon: Database, cls: "text-verified" },
  { id: "ask", icon: UserRound, cls: "text-signal" },
  { id: "never", icon: Ban, cls: "text-abort" },
]

function RequestCard() {
  const phase = useDemo((s) => s.requestPhase)
  const requester = getActor(REQUEST.requesterId)
  const status = phase === "done" ? "scoped" : "scoping"
  return (
    <div className="rounded-lg border bg-card p-3.5 shadow-sm">
      <div className="flex items-start gap-3">
        <ActorAvatar id={REQUEST.requesterId} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{requester.name}</span>
            <span>· {requester.role}</span>
            <span className="ml-auto font-mono text-[11px]">{REQUEST.label}</span>
          </div>
          <p className="mt-1.5 text-[14px] font-medium leading-5">&ldquo;{REQUEST.text}&rdquo;</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="tabular">Submitted {relativeTime(REQUEST.submittedAt)}</span>
              </TooltipTrigger>
              <TooltipContent>{absoluteTime(REQUEST.submittedAt)}</TooltipContent>
            </Tooltip>
            <span>·</span>
            <span>Project Atlas · IC Nov 20</span>
            <RequestStatusPill status={status} className="ml-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}

function PlanItemRow({ id, index }: { id: string; index: number }) {
  const item = PLAN_ITEMS.find((p) => p.id === id)
  if (!item) return null
  return (
    <motion.li initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: "easeOut", delay: index === 0 ? 0 : 0 }} className="flex items-start gap-1.5 text-[12px] leading-4">
      {item.personId ? <ActorAvatar id={item.personId} size="xs" className="mt-0" /> : <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />}
      <span className="min-w-0">
        <span className="block truncate font-medium text-foreground">{item.label}</span>
        {item.sub && <span className="block truncate text-[11px] text-muted-foreground">{item.sub}</span>}
      </span>
    </motion.li>
  )
}

function ScopePlan() {
  const plan = useDemo((s) => s.plan)
  const phase = useDemo((s) => s.requestPhase)
  const total = plan.needs.length + plan.ask.length + plan.never.length
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b px-3.5 py-2">
        <span className="text-[12px] font-semibold">Scope plan</span>
        <span className="text-[11px] text-muted-foreground">drafted by connect-agent from metadata</span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground tabular">{total} of {PLAN_ITEMS.length}</span>
      </div>
      <div className="grid grid-cols-3 divide-x">
        {COLUMNS.map((c) => {
          const Icon = c.icon
          const items = plan[c.id]
          return (
            <div key={c.id} className="min-w-0 px-3 py-2.5">
              <div className={cn("mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide", c.cls)}>
                <Icon className="h-3 w-3" /> {PLAN_COLUMN_LABEL[c.id]}
              </div>
              <ul className={cn("space-y-1.5", c.cls)}>
                {items.map((id, i) => (
                  <PlanItemRow key={id} id={id} index={i} />
                ))}
                {items.length === 0 && <li className="text-[11px] italic text-muted-foreground">{phase === "idle" ? "—" : "…"}</li>}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChipView({ chip }: { chip: Chip }) {
  const m = CHIP_META[chip.kind]
  const Icon = m.icon
  return (
    <motion.span initial={{ opacity: 0, scale: 0.85, y: 3 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} className={cn("inline-flex max-w-full items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-4", m.cls)}>
      <Icon className="h-3 w-3 shrink-0" />
      <span className="opacity-70">{m.label}:</span>
      <span className="truncate">{chip.label}</span>
    </motion.span>
  )
}

function Entry({ e }: { e: TranscriptEntry }) {
  const beat = BEATS.find((b) => b.n === e.beat)
  if (e.kind === "question") {
    const p = beat ? getActor(beat.person) : null
    return (
      <motion.div id={`entry-${e.id}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-start gap-2.5">
        <EMark size={22} className="mt-0.5" />
        <div className="min-w-0">
          <div className="mb-0.5 font-mono text-[10px] text-muted-foreground">
            Enakt → {p?.name.split(" ")[0]} <span className="opacity-60">· clarification {e.beat}</span>
          </div>
          <div className="text-[13px] font-medium leading-5">{e.text}</div>
        </div>
      </motion.div>
    )
  }
  const p = getActor(e.speaker)
  return (
    <motion.div id={`entry-${e.id}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="ml-8 flex items-start gap-2.5 scroll-mt-4">
      <ActorAvatar id={e.speaker} size="sm" className="mt-0.5" />
      <div className="min-w-0 flex-1 rounded-lg border bg-card px-3 py-2">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="font-medium text-foreground">{p.name}</span>
          <span>· {p.role}</span>
          {e.done && <Check className="ml-auto h-3 w-3 text-verified" />}
        </div>
        <p className="text-[13px] leading-5">
          {e.text.slice(0, e.shown)}
          {!e.done && <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-cursor-blink bg-foreground" />}
        </p>
        {e.chips.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {e.chips.map((c) => (
              <ChipView key={c.id} chip={c} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ScanLine() {
  const scan = useDemo((s) => s.scan)
  const systems = useDemo((s) => s.scanSystems)
  const files = useDemo((s) => s.scanFiles)
  return (
    <div className={cn("relative flex items-center gap-2 overflow-hidden rounded-md border px-3 py-1.5 font-mono text-[11px] tabular", scan === "done" ? "border-verified/30 bg-verified-soft/60 text-verified" : scan === "running" ? "border-signal/20 bg-signal-soft/60 text-signal" : "bg-muted/40 text-muted-foreground")}>
      {scan === "running" && <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />}
      <span className="relative inline-flex items-center gap-1.5">
        {scan === "done" ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
        {scan === "done" ? SCAN.done : scan === "running" ? `${SCAN.running} · ${systems} systems · ${fmtInt(files)} files · ${SCAN.rows} rows read.` : "Scan not started · schemas and metadata only."}
      </span>
    </div>
  )
}

export default function RequestPage() {
  const phase = useDemo((s) => s.requestPhase)
  const transcript = useDemo((s) => s.transcript)
  const people = useDemo((s) => s.people)
  const speed = useDemo((s) => s.speed)
  const setSpeed = useDemo((s) => s.setSpeed)
  const start = useDemo((s) => s.startRequest)
  const pause = useDemo((s) => s.pauseRequest)
  const resume = useDemo((s) => s.resumeRequest)
  const skip = useDemo((s) => s.skipRequest)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = scrollRef.current
    if (el && phase === "playing") el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [transcript, phase])

  // Deep link from a policy card: /requests/r-3#entry-b2-a
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return
    const t = setTimeout(() => document.querySelector(window.location.hash)?.scrollIntoView({ behavior: "smooth", block: "center" }), 420)
    return () => clearTimeout(t)
  }, [transcript.length])

  const fast = speed >= 2
  const answered = Object.values(people).filter((p) => p === "answered").length

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <h1 className="font-display text-[18px] font-medium leading-6 tracking-[-0.02em]">Request R-3</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">A request, a scope plan, and short clarifications to the people who own the data.</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setSpeed(fast ? 1 : 2)}
                className={cn("h-8 rounded-md border px-2 font-mono text-[11px] font-medium transition-colors", fast ? "border-signal/40 bg-signal-soft text-signal" : "bg-card text-muted-foreground hover:bg-accent")}
                aria-pressed={fast}
              >
                {speed}×
              </button>
            </TooltipTrigger>
            <TooltipContent>Script speed for recording</TooltipContent>
          </Tooltip>
          {phase === "idle" && (
            <Button size="sm" variant="signal" onClick={start} id="start-request">
              <Play /> Start
            </Button>
          )}
          {phase === "playing" && (
            <Button size="sm" variant="outline" onClick={pause}>
              <Pause /> Pause
            </Button>
          )}
          {phase === "paused" && (
            <Button size="sm" variant="signal" onClick={resume}>
              <Play /> Resume
            </Button>
          )}
          {(phase === "playing" || phase === "paused") && (
            <Button size="sm" variant="ghost" onClick={skip}>
              <FastForward /> Skip to end
            </Button>
          )}
          {phase === "done" && (
            <Button size="sm" variant="outline" onClick={start}>
              <Play /> Run again
            </Button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3 scrollbar-thin">
        <RequestCard />
        <ScopePlan />

        <div className="flex items-center gap-2 pt-1 text-[12px] font-semibold">
          Clarifications <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground tabular">{BEATS.length}</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-normal text-muted-foreground">
            {answered} of {BEATS.length} answered · {MODEL.name}
          </span>
        </div>
        <ScanLine />

        {transcript.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center">
            <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-signal-soft text-signal">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="text-sm font-medium">Three questions, two people</div>
            <div className="mt-1 max-w-[280px] text-xs text-muted-foreground">Press Start. Enakt scans metadata, drafts the scope plan, and asks Tom and Nina only what the agent needs to know.</div>
          </div>
        )}
        <div className="space-y-4">
          {transcript.map((e) => (
            <Entry key={e.id} e={e} />
          ))}
        </div>
        <AnimatePresence>
          {phase === "done" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="rounded-lg border border-verified/30 bg-verified-soft p-3">
              <div className="flex items-start gap-2 text-[12px] font-medium leading-5 text-verified">
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{REQUEST_BANNER}</span>
              </div>
              <Button asChild size="sm" variant="verified" className="mt-2.5 w-full">
                <Link href={href("/map")} id="review-map">
                  Review the map <ArrowRight />
                </Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
