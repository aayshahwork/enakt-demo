"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Loader2, PlayCircle, Rocket, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ActorAvatar, getActor } from "@/components/demo/actor"
import { Card, CardHeader, PageHeader } from "@/components/demo/page"
import { StagePill } from "@/components/demo/status-pill"
import { DEPLOY, HERO, READINESS, ROLLOUT, href } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

/** Beat 7. Deploying works like merging a change into the firm's infrastructure. */
export default function DeployPage() {
  const status = useDemo((s) => s.deployStatus)
  const pct = useDemo((s) => s.deployPct)
  const approvals = useDemo((s) => s.approvals)
  const deploy = useDemo((s) => s.deploy)
  const heroStage = useDemo((s) => s.heroStage)
  const deployed = status === "deployed"
  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-6">
      <Link href={href("/agents/cim-screener")} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> {HERO.name}
      </Link>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2.5">
            Deploy {HERO.name} to the firm <StagePill stage={heroStage ?? "review"} />
          </span>
        }
        description="What changes in Kestrel Ridge's infrastructure when this goes live. Review it, then deploy."
        actions={
          deployed ? (
            <Button variant="verified" size="sm" disabled className="disabled:opacity-100">
              <Check /> Deployed
            </Button>
          ) : status === "deploying" ? (
            <Button variant="signal" size="sm" disabled className="relative overflow-hidden disabled:opacity-100">
              <span className="absolute inset-y-0 left-0 bg-white/20 transition-[width] duration-75 dark:bg-ink/15" style={{ width: `${pct}%` }} />
              <Loader2 className="animate-spin" /> Deploying {pct}%
            </Button>
          ) : (
            <Button variant="verified" size="sm" onClick={() => void deploy()} id="deploy">
              <Rocket /> Deploy
            </Button>
          )
        }
      />

      <div className="grid grid-cols-4 overflow-hidden rounded-xl border bg-card shadow-sm">
        {DEPLOY.summary.map((s, i) => (
          <div key={s.label} className={cn("px-4 py-3", i > 0 && "border-l")}>
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-0.5 font-display text-2xl font-medium tracking-[-0.03em] tabular">{s.value}</div>
            <div className="line-clamp-2 text-[11px] leading-4 text-muted-foreground">{s.hint}</div>
          </div>
        ))}
      </div>

      <Card className="flex items-center gap-3 px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-verified-soft text-verified">
          <PlayCircle className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">Dry run</div>
          <div className="text-xs text-muted-foreground">{DEPLOY.dryRun}</div>
        </div>
        <Badge variant="verified">Passed</Badge>
      </Card>

      <Card>
        <CardHeader title="Approvals" action={<span className="text-xs text-muted-foreground tabular">{approvals.length} of {DEPLOY.approvers.length}</span>} />
        <ul className="divide-y">
          {DEPLOY.approvers.map((a) => {
            const done = approvals.includes(a.id)
            return (
              <li key={a.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <ActorAvatar id={a.id} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{getActor(a.id).name}</span> <span className="text-muted-foreground">· {a.role} · {a.when}</span>
                </span>
                {done ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-verified-soft px-2 py-0.5 text-[11px] font-medium text-verified">
                    <Check className="h-3 w-3" /> Approved
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">pending</span>
                )}
              </li>
            )
          })}
        </ul>
        <div className="flex items-center gap-2 border-t bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" /> Scoped credentials are issued by each source system on deploy. Nothing outside this list changes.
        </div>
      </Card>

      <AnimatePresence>
        {deployed && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="rounded-lg border border-verified/40 bg-verified-soft p-4 text-sm">
            <div className="font-medium">Live. What just changed:</div>
            <ul className="mt-1.5 space-y-1 text-muted-foreground">
              <li>· {HERO.name} moved to Deployed in the pipeline</li>
              <li>· deals@ inbox is connected: red → yellow on the firm map</li>
              <li>· Firm AI-readiness {READINESS.before}% → {READINESS.after}%</li>
              <li>· Rollout: first agent live, Day {ROLLOUT.liveDay} of {ROLLOUT.total}</li>
            </ul>
            <Button asChild size="sm" variant="verified" className="mt-3">
              <Link href={href("/agents/cim-screener/run")} id="to-run">
                See it run on a new CIM <ArrowRight />
              </Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
