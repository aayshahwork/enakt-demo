"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Database, GitBranch, HelpCircle, ShieldCheck, Users } from "lucide-react"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

function Counter({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; accent?: string }) {
  const [bump, setBump] = React.useState(false)
  const prev = React.useRef(value)
  React.useEffect(() => {
    if (prev.current === value) return
    prev.current = value
    setBump(true)
    const t = setTimeout(() => setBump(false), 300)
    return () => clearTimeout(t)
  }, [value])
  return (
    <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border bg-card px-2 py-1.5 shadow-sm">
      <Icon className={cn("h-3.5 w-3.5", accent ?? "text-muted-foreground")} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="relative inline-flex h-5 w-6 items-center justify-end overflow-hidden font-mono text-sm font-medium tabular">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={value} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className={cn(bump && accent)}>
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  )
}

export function IntakeCounters() {
  const sources = useDemo((s) => Object.values(s.nodes).filter((n) => n && !n.placeholder).length)
  const people = useDemo((s) => s.people.length)
  const workflows = useDemo((s) => s.workflows.length)
  const policies = useDemo((s) => s.policies.length)
  const questions = useDemo((s) => Object.values(s.openQuestions).filter((q) => q === "open").length)
  const readiness = useDemo((s) => s.readiness)
  return (
    <div className="flex items-center gap-1.5 overflow-hidden border-b bg-background/95 px-3 py-2">
      <Counter icon={Database} label="Sources" value={sources} accent="text-signal" />
      <Counter icon={Users} label="People" value={people} accent="text-verified" />
      <Counter icon={GitBranch} label="Workflows" value={workflows} accent="text-signal" />
      <Counter icon={ShieldCheck} label="Policies" value={policies} accent="text-merged" />
      <Counter icon={HelpCircle} label="Open questions" value={questions} accent="text-flagged" />
      <div className="flex-1" />
      <AnimatePresence>
        {readiness === "running" && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-signal" /> Readiness pass
          </motion.span>
        )}
        {readiness === "done" && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-1.5 text-xs text-verified">
            0 rows read
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
