"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Check, Play, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ActorAvatar } from "@/components/demo/actor"
import { EMark } from "@/components/demo/logo"
import { Card, PageHeader } from "@/components/demo/page"
import { EMPLOYEE, HERO_REQUEST, REQUEST_FEED, TRUST, href } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

/** Beat 3. Maya types the ask; a status line shows Enakt working inside the firm's cloud on metadata only. */
export default function NewRequestPage() {
  const phase = useDemo((s) => s.seq.ask)
  const typed = useDemo((s) => s.askTyped)
  const status = useDemo((s) => s.askStatus)
  const startSeq = useDemo((s) => s.startSeq)
  const rec = useDemo((s) => s.rec)
  const text = HERO_REQUEST.text.slice(0, typed)
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6 pt-10">
      <PageHeader title={`Ask ${EMPLOYEE.name} for an automation`} description="Describe it the way you would to a colleague. Enakt works out which data it needs and who to check with." />
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <ActorAvatar id="maya" size="md" />
          <div className="min-w-0 flex-1">
            <div className="min-h-[72px] rounded-lg border bg-background px-3.5 py-2.5 text-[16px] leading-7" aria-label="Request" role="textbox" aria-readonly>
              {text}
              {phase === "playing" && typed < HERO_REQUEST.text.length && <span className="ml-0.5 inline-block h-5 w-[2px] translate-y-1 animate-cursor-blink bg-foreground" />}
              {typed === 0 && <span className="text-muted-foreground">Screen every inbound CIM against…</span>}
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <span className={cn("relative inline-flex flex-1 items-center gap-2 overflow-hidden rounded-md px-2.5 py-1.5 font-mono text-[11px]", status === "working" ? "bg-signal-soft text-signal" : status === "done" ? "bg-verified-soft text-verified" : "text-muted-foreground")}>
                {status === "working" && <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />}
                <span className="relative inline-flex items-center gap-1.5">
                  {status === "done" ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {status === "idle" ? "Enakt reads only metadata: which systems exist, who owns them, who may see what." : status === "working" ? TRUST.statusLine : "Request R-7 created · 6 questions to confirm the scope"}
                </span>
              </span>
              {phase === "idle" && (
                <Button size="sm" variant="signal" onClick={() => startSeq("ask")} id="start-ask">
                  <Play /> Ask
                </Button>
              )}
            </div>
          </div>
        </div>
        <AnimatePresence>
          {status === "done" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mt-4 flex items-center gap-3 rounded-lg border border-verified/30 bg-verified-soft p-3">
              <EMark size={28} />
              <div className="min-w-0 flex-1 text-sm">
                <span className="font-medium">Got it.</span> I need a few answers from you, and a word with the people who own the CIM inbox, the criteria and the deal walls.
              </div>
              <Button asChild size="sm" variant="verified">
                <Link href={href("/requests/r-7")} id="to-questions">
                  Answer the questions <ArrowRight />
                </Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      {!rec && (
        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground">What others at the firm have asked for</div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {REQUEST_FEED.slice(0, 4).map((r) => (
              <li key={r.id} className="flex items-start gap-2 rounded-lg border bg-card px-3 py-2 text-xs">
                <ActorAvatar id={r.requesterId} size="xs" className="mt-0.5" />
                <span className="line-clamp-2 leading-4 text-muted-foreground">&ldquo;{r.text}&rdquo;</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
