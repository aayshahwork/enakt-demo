"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Check, Circle, Loader2, Play, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, PageHeader } from "@/components/demo/page"
import { StagePill } from "@/components/demo/status-pill"
import { BUILD_STEPS, HERO, href } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

/** Beat 5. Nine steps tick with a one-line result each. */
export default function BuildPage() {
  const phase = useDemo((s) => s.seq.build)
  const step = useDemo((s) => s.buildStep)
  const startSeq = useDemo((s) => s.startSeq)
  const heroStage = useDemo((s) => s.heroStage)
  const rec = useDemo((s) => s.rec)
  const done = phase === "done"
  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-6">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2.5">
            Building {HERO.name} <StagePill stage={heroStage ?? "building"} />
          </span>
        }
        description="Permissions, the sandbox, the evaluation and the learning loop. Set up while Maya answered six questions."
        actions={
          phase === "idle" ? (
            <Button size="sm" variant="signal" onClick={() => startSeq("build")} id="start-build">
              <Play /> Build
            </Button>
          ) : phase !== "done" && !rec ? null : null
        }
      />
      <Card>
        <ol className="divide-y">
          {BUILD_STEPS.map((s) => {
            const ticked = step >= s.n
            const active = phase === "playing" && step === s.n - 1
            return (
              <li key={s.n} className={cn("flex items-start gap-3 px-4 py-3 transition-colors", ticked ? "" : "text-muted-foreground", active && "bg-signal-soft/40")}>
                <span className="mt-0.5 w-5 shrink-0 font-mono text-[11px] text-muted-foreground tabular">{s.n}</span>
                <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", ticked ? "border-verified bg-verified-soft text-verified" : active ? "border-signal text-signal" : "text-muted-foreground/60")}>
                  {ticked ? <Check className="h-3 w-3" /> : active ? <Loader2 className="h-3 w-3 animate-spin" /> : <Circle className="h-2 w-2 fill-current" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={cn("text-sm font-medium", s.n === 9 && ticked && "text-verified")}>{s.label}</div>
                  <AnimatePresence initial={false}>
                    {ticked && s.result && (
                      <motion.div initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="text-xs leading-5 text-muted-foreground">
                        {s.result}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </li>
            )
          })}
        </ol>
        <div className="flex items-center gap-2 border-t bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" /> Everything runs in Kestrel Ridge&apos;s cloud. Scoped credentials are issued by the source systems, not by the agent.
        </div>
      </Card>
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center gap-3 rounded-lg border border-merged/40 bg-merged-soft p-3 text-sm">
            <Check className="h-4 w-4 text-merged" />
            <span className="flex-1">
              <span className="font-medium">Ready for review.</span> Nothing is live until Maya reviews the permissions and deploys it.
            </span>
            <Button asChild size="sm" variant="merged">
              <Link href={href("/agents/cim-screener")} id="to-review">
                Review security permissions <ArrowRight />
              </Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
