"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Check, FastForward, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ActorAvatar } from "@/components/demo/actor"
import { EMark } from "@/components/demo/logo"
import { StagePill } from "@/components/demo/status-pill"
import { HERO_REQUEST, QUESTIONS, TRUST, href } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

function QuestionBlock({ id }: { id: string }) {
  const q = QUESTIONS.find((x) => x.id === id)!
  const state = useDemo((s) => s.qa.find((x) => x.id === id))
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="space-y-2">
      <div className="flex items-start gap-2.5">
        <EMark size={22} className="mt-0.5" />
        <div className="min-w-0">
          <div className="mb-0.5 font-mono text-[10px] text-muted-foreground">Enakt · question {q.n} of {QUESTIONS.length}</div>
          <div className="text-[13.5px] font-medium leading-5">{q.text}</div>
        </div>
      </div>
      {state?.chips && (
        <div className="ml-8 flex flex-wrap gap-1.5">
          {q.chips.map((c, i) => {
            const picked = state.picked && i === q.pick
            const faded = state.picked && i !== q.pick
            return (
              <motion.button
                key={c}
                type="button"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: faded ? 0.35 : 1, y: 0, scale: picked ? 1.02 : 1 }}
                transition={{ duration: 0.2, delay: i * 0.06 }}
                className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] leading-5 transition-colors", picked ? "border-signal bg-signal text-white dark:text-ink" : "bg-card hover:bg-accent")}
                aria-pressed={picked}
              >
                {picked && <Check className="h-3.5 w-3.5" />}
                {c}
              </motion.button>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

export default function RequestPage() {
  const phase = useDemo((s) => s.seq.scope)
  const qa = useDemo((s) => s.qa)
  const startSeq = useDemo((s) => s.startSeq)
  const skipSeq = useDemo((s) => s.skipSeq)
  const togglePause = useDemo((s) => s.togglePause)
  const heroStage = useDemo((s) => s.heroStage)
  const rec = useDemo((s) => s.rec)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const el = scrollRef.current
    if (el && phase === "playing") el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [qa, phase])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <h1 className="font-display text-[18px] font-medium leading-6 tracking-[-0.02em]">Request R-7</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">Enakt asks a few questions. Each answer lights up what the agent will need.</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {phase === "idle" && (
            <Button size="sm" variant="signal" onClick={() => startSeq("scope")} id="start-scope">
              <Play /> Start
            </Button>
          )}
          {(phase === "playing" || phase === "paused") && (
            <>
              <Button size="sm" variant="outline" onClick={() => togglePause()}>
                {phase === "playing" ? <Pause /> : <Play />} {phase === "playing" ? "Pause" : "Resume"}
              </Button>
              {!rec && (
                <Button size="sm" variant="ghost" onClick={() => skipSeq("scope")}>
                  <FastForward /> Skip
                </Button>
              )}
            </>
          )}
          {phase === "done" && !rec && (
            <Button size="sm" variant="outline" onClick={() => startSeq("scope")}>
              <Play /> Run again
            </Button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3 scrollbar-thin">
        <div className="rounded-lg border bg-card p-3.5 shadow-sm">
          <div className="flex items-start gap-3">
            <ActorAvatar id={HERO_REQUEST.requesterId} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Maya Chen</span> · Vice President
                <span className="ml-auto font-mono text-[11px]">{HERO_REQUEST.label}</span>
              </div>
              <p className="mt-1 text-[14px] font-medium leading-5">&ldquo;{HERO_REQUEST.text}&rdquo;</p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="truncate">{TRUST.statusLine}</span>
                {heroStage && <StagePill stage={heroStage} className="ml-auto" />}
              </div>
            </div>
          </div>
        </div>

        {qa.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center">
            <EMark size={36} className="mb-3" />
            <div className="text-sm font-medium">Six quick questions</div>
            <div className="mt-1 max-w-[300px] text-xs text-muted-foreground">Maya answers with a tap. While she does, Enakt checks with the people who own the data.</div>
          </div>
        )}
        {qa.map((q) => (
          <QuestionBlock key={q.id} id={q.id} />
        ))}
        <AnimatePresence>
          {phase === "done" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="rounded-lg border border-verified/30 bg-verified-soft p-3">
              <div className="flex items-start gap-2 text-[12px] font-medium leading-5 text-verified">
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Scoped · 6 sources, 2 excluded · 3 owners confirmed · nothing outside the scope can be read</span>
              </div>
              <Button asChild size="sm" variant="verified" className="mt-2.5 w-full">
                <Link href={href("/agents/cim-screener/build")} id="to-build">
                  Build the agent <ArrowRight />
                </Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
