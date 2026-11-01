"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Bot, Check, Database, FastForward, GitBranch, HelpCircle, ListTodo, Pause, Play, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ActorAvatar, getActor } from "@/components/demo/actor"
import { EMark } from "@/components/demo/logo"
import { MODEL, PEOPLE, href } from "@/lib/demo/fixtures"
import { BEATS, INTAKE_BANNER, type Chip, type TranscriptEntry } from "@/lib/demo/script"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

const CHIP_META: Record<Chip["kind"], { label: string; icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  source: { label: "Source", icon: Database, cls: "border-signal/30 bg-signal-soft text-signal" },
  workflow: { label: "Workflow", icon: GitBranch, cls: "border-verified/30 bg-verified-soft text-verified" },
  policy: { label: "Policy", icon: ShieldCheck, cls: "border-merged/30 bg-merged-soft text-merged" },
  task: { label: "Task", icon: ListTodo, cls: "border-flagged/30 bg-flagged-soft text-flagged" },
  question: { label: "Open question", icon: HelpCircle, cls: "border-flagged/40 bg-flagged-soft text-flagged" },
}

const INTERVIEW_ORDER = ["dana", "marcus", "priya", "sam", "chris", "planning"]

function IntervieweeList() {
  const statuses = useDemo((s) => s.interviewees)
  return (
    <div className="flex w-[124px] shrink-0 flex-col gap-0.5 border-r px-2 py-3">
      <div className="mb-1 px-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Interviews</div>
      {INTERVIEW_ORDER.map((id) => {
        const p = PEOPLE[id]
        const st = statuses[id] ?? "scheduled"
        return (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <div className={cn("flex items-center gap-1.5 rounded-md px-1 py-1 transition-colors", st === "interviewing" && "bg-card shadow-sm")}>
                <ActorAvatar id={id} size="xs" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] font-medium leading-4">{p.kind === "group" ? "Planning" : p.name.split(" ")[0]}</div>
                  <div className={cn("flex items-center gap-1 text-[10px] leading-3", st === "noresponse" ? "text-abort" : st === "done" ? "text-verified" : st === "interviewing" ? "text-signal" : "text-muted-foreground")}>
                    {st === "interviewing" && <span className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-signal" />}
                    {st === "done" && <Check className="h-2.5 w-2.5" />}
                    {st === "scheduled" ? "Scheduled" : st === "interviewing" ? "Interviewing" : st === "done" ? "Done" : "No response"}
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              {p.name} · {p.role}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}

function ChipView({ chip, index }: { chip: Chip; index: number }) {
  const m = CHIP_META[chip.kind]
  const Icon = m.icon
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85, y: 3 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut", delay: index === 0 ? 0 : 0 }}
      className={cn("inline-flex max-w-full items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-4", m.cls)}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span className="opacity-70">{m.label}:</span>
      <span className="truncate">{chip.label}</span>
    </motion.span>
  )
}

function InterviewHeader({ person, via, n }: { person: string; via?: string; n: number }) {
  const p = getActor(person)
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-md border bg-muted/40 px-2.5 py-1.5 text-[11px]">
      <ActorAvatar id={person} size="xs" />
      <span className="whitespace-nowrap font-medium">{p.name}</span>
      <span className="whitespace-nowrap text-muted-foreground">· {p.role}</span>
      <span className="ml-auto inline-flex items-center gap-1 whitespace-nowrap text-muted-foreground">
        <Bot className="h-3 w-3" /> via local model · metadata only
      </span>
      <span className="sr-only">Interview {n}</span>
      {via === "assistant" && <span className="sr-only">answered by assistant</span>}
    </div>
  )
}

function Entry({ e, prevSpeaker }: { e: TranscriptEntry; prevSpeaker: string | null }) {
  const beat = BEATS.find((b) => b.n === e.beat)
  if (e.kind === "question") {
    const newPerson = beat && beat.person !== prevSpeaker
    return (
      <div className="space-y-2">
        {newPerson && <InterviewHeader person={beat.person} via={beat.via} n={beat.n} />}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-start gap-2.5">
          <EMark size={22} className="mt-0.5" />
          <div className="min-w-0">
            <div className="mb-0.5 font-mono text-[10px] text-muted-foreground">Enakt</div>
            <div className="text-[13px] font-medium leading-5">{e.text}</div>
          </div>
        </motion.div>
      </div>
    )
  }
  if (e.kind === "system") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn("ml-8 rounded-md border px-3 py-2 text-[12px] leading-5", e.tone === "error" ? "border-abort/30 bg-abort-soft text-abort" : "relative overflow-hidden border-signal/20 bg-signal-soft/60 text-signal")}
      >
        {e.tone === "progress" && !e.done && <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />}
        <span className="relative inline-flex items-center gap-1.5">
          {e.tone === "progress" ? e.done ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" /> : null}
          {e.text}
        </span>
        {e.chips.length > 0 && (
          <div className="relative mt-2 flex flex-wrap gap-1.5">
            {e.chips.map((c, i) => (
              <ChipView key={c.id} chip={c} index={i} />
            ))}
          </div>
        )}
      </motion.div>
    )
  }
  const p = getActor(e.speaker)
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="ml-8 flex items-start gap-2.5">
      <ActorAvatar id={e.speaker} size="sm" className="mt-0.5" />
      <div className="min-w-0 flex-1 rounded-lg border bg-card px-3 py-2">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="font-medium text-foreground">{p.name}</span>
          {e.via === "assistant" ? (
            <span className="inline-flex items-center gap-1">
              · answered by <span className="font-mono">{e.speaker}-assistant</span>, confirmed by {p.name.split(" ")[0]}
            </span>
          ) : (
            <span>· answered {p.name.split(" ")[0] === "Dana" ? "herself" : "in person"}</span>
          )}
          {e.done && <Check className="ml-auto h-3 w-3 text-verified" />}
        </div>
        <p className="text-[13px] leading-5">
          {e.text.slice(0, e.shown)}
          {!e.done && <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-cursor-blink bg-foreground" />}
        </p>
        {e.chips.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {e.chips.map((c, i) => (
              <ChipView key={c.id} chip={c} index={i} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function IntakePage() {
  const phase = useDemo((s) => s.intakePhase)
  const transcript = useDemo((s) => s.transcript)
  const speed = useDemo((s) => s.speed)
  const setSpeed = useDemo((s) => s.setSpeed)
  const start = useDemo((s) => s.startIntake)
  const pause = useDemo((s) => s.pauseIntake)
  const resume = useDemo((s) => s.resumeIntake)
  const skip = useDemo((s) => s.skipIntake)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [transcript, phase])

  const fast = speed >= 2

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <h1 className="font-display text-[18px] font-medium leading-6 tracking-[-0.02em]">Intake</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">Enakt interviews the firm. It reads names, owners and row counts. Never a row.</p>
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
            <Button size="sm" variant="signal" onClick={start} id="start-interview">
              <Play /> Start interview
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

      <div className="flex min-h-0 flex-1">
        <IntervieweeList />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-1.5 text-[11px]">
            <span className="relative flex h-2 w-2">
              {phase === "playing" && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-verified opacity-60" />}
              <span className={cn("relative inline-flex h-2 w-2 rounded-full", phase === "playing" ? "bg-verified" : "bg-muted-foreground/50")} />
            </span>
            <span className="font-medium">{MODEL.name} on {MODEL.host}</span>
            <span className="ml-auto whitespace-nowrap text-muted-foreground">Metadata only · 0 rows read</span>
          </div>

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-3 scrollbar-thin">
            {transcript.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-signal-soft text-signal">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div className="text-sm font-medium">Six interviews scheduled</div>
                <div className="mt-1 max-w-[260px] text-xs text-muted-foreground">Start the interview. Each answer is typed into sources, workflows, policies and open questions, and lands on the map as it is said.</div>
              </div>
            )}
            {transcript.map((e, i) => {
              const prevBeat = i > 0 ? BEATS.find((b) => b.n === transcript[i - 1].beat) : undefined
              return <Entry key={e.id} e={e} prevSpeaker={prevBeat?.person ?? null} />
            })}
            <AnimatePresence>
              {phase === "done" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="rounded-lg border border-verified/30 bg-verified-soft p-3">
                  <div className="flex items-start gap-2 text-[12px] font-medium leading-5 text-verified">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{INTAKE_BANNER}</span>
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
      </div>
    </div>
  )
}
