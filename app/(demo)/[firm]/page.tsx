"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Check, Eye, GitMerge, HelpCircle, Server, ShieldCheck, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ActorAvatar, ActorName } from "@/components/demo/actor"
import { Card, CardHeader, PageHeader, Stat } from "@/components/demo/page"
import { SourceIcon } from "@/components/demo/source-icon"
import { Truncate } from "@/components/demo/truncate"
import { VerdictPill } from "@/components/demo/verdict-pill"
import { AUDIT, BRAIN, DEPLOYMENT, MODEL, OPEN_QUESTIONS, PEOPLE, POLICIES, SOURCES, WORKFLOWS, href, type AuditKind } from "@/lib/demo/fixtures"
import { relativeTime } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

const KIND_ICON: Record<AuditKind, { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  blocked: { icon: X, cls: "text-abort" },
  merge: { icon: GitMerge, cls: "text-merged" },
  policy: { icon: ShieldCheck, cls: "text-merged" },
  read: { icon: Eye, cls: "text-muted-foreground" },
  intake: { icon: Sparkles, cls: "text-signal" },
  task: { icon: Check, cls: "text-verified" },
  system: { icon: Server, cls: "text-muted-foreground" },
}

const ATTENTION_ORDER = ["conflict", "stale", "unverified"] as const

export default function OverviewPage() {
  const progress = useDemo((s) => s.progress)
  const brainMerged = useDemo((s) => s.brainMerged)
  const intakeDone = useDemo((s) => s.intakePhase === "done")
  const mergeStatus = useDemo((s) => s.mergeStatus)
  const extraAudit = useDemo((s) => s.extraAudit)

  const activity = React.useMemo(() => [...extraAudit, ...AUDIT].slice(0, 8), [extraAudit])
  const merged = progress >= BRAIN.after
  const mergedCount = intakeDone || brainMerged > 0 ? brainMerged : BRAIN.mergedBefore

  const attention = ATTENTION_ORDER.flatMap((v) => SOURCES.filter((s) => s.verdict === v))
  const planningQuestion = OPEN_QUESTIONS["planning-owner"]

  const taskGroups = React.useMemo(() => {
    const groups = new Map<string, typeof SOURCES>()
    for (const s of SOURCES) {
      if (!s.task) continue
      const list = groups.get(s.task.assignee) ?? []
      if (list.some((x) => x.task!.text === s.task!.text)) continue
      list.push(s)
      groups.set(s.task.assignee, list)
    }
    return [...groups.entries()]
  }, [])

  const fromIntake = POLICIES.filter((p) => p.fromIntake).length

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <PageHeader title="Overview" description="Ashcombe Trust Company · what is in the brain, what is not, and who owns the gap." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Firm in the brain" value={`${Math.round(progress)}%`} hint={`${mergedCount} of ${BRAIN.total} sources merged`} accent={merged ? "var(--merged)" : "var(--signal)"} />
        <Stat label="Sources mapped" value={SOURCES.length} hint="6 people interviewed" />
        <Stat label="Workflows" value={WORKFLOWS.length} hint="owners confirmed" />
        <Stat label="Policies enforced" value={POLICIES.length} hint={`${fromIntake} from intake`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                Needs attention <span className="rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground tabular">{attention.length + 1}</span>
              </span>
            }
            action={
              <Link href={href("/build")} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                Open Build
              </Link>
            }
          />
          <ul className="divide-y">
            {attention.map((s) => (
              <li key={s.id}>
                <Link href={href(`/build?source=${s.id}`)} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/60">
                  <SourceIcon type={s.type} size={14} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{s.name}</div>
                    <Truncate className="text-xs text-muted-foreground" text={s.reason}>
                      {s.reason}
                    </Truncate>
                  </div>
                  <VerdictPill verdict={s.verdict} />
                </Link>
              </li>
            ))}
            <li>
              <Link href={href("/build?source=planning-cases")} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/60">
                <span className="inline-flex h-[19.6px] w-[19.6px] shrink-0 items-center justify-center rounded-md bg-flagged-soft text-flagged">
                  <HelpCircle className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{planningQuestion.text}</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    Routed to <ActorAvatar id={planningQuestion.routedTo} size="xs" /> {PEOPLE[planningQuestion.routedTo].name}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-flagged-soft px-2 py-0.5 text-[11px] font-medium text-flagged">Open question</span>
              </Link>
            </li>
          </ul>
        </Card>

        <Card>
          <CardHeader title="This week" action={<span className="text-xs text-muted-foreground">by owner</span>} />
          <div className="divide-y">
            {taskGroups.map(([owner, sources]) => (
              <div key={owner} className="px-4 py-3">
                <div className="mb-1.5 flex items-center gap-2 text-xs">
                  <ActorAvatar id={owner} size="xs" />
                  <ActorName id={owner} withRole className="text-xs" />
                </div>
                <ul className="space-y-1">
                  {sources.map((s) => {
                    const done = mergeStatus === "merged" && s.task!.text === "Approve MR-14"
                    return (
                      <li key={s.id} className="flex items-center gap-2 pl-7 text-sm">
                        {done ? <Check className="h-3.5 w-3.5 shrink-0 text-verified" /> : <span className="h-3.5 w-3.5 shrink-0 rounded-full border" />}
                        <span className={cn("min-w-0 flex-1 truncate", done && "text-muted-foreground line-through")}>{s.task!.text}</span>
                        <span className="shrink-0 text-xs text-muted-foreground tabular">due {s.task!.due}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Recent activity"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href={href("/audit")}>
                View audit log <ArrowRight />
              </Link>
            </Button>
          }
        />
        <ul className="divide-y">
          {activity.map((a) => {
            const k = KIND_ICON[a.kind]
            const Icon = k.icon
            const row = (
              <>
                <ActorAvatar id={a.actorId} size="sm" />
                <span className="min-w-0 flex-1 text-sm">
                  <ActorName id={a.actorId} /> <span className={cn(a.kind === "blocked" ? "text-abort" : "text-muted-foreground")}>{a.text}</span>
                </span>
                <Icon className={cn("h-3.5 w-3.5 shrink-0", k.cls)} />
                <span className="w-16 shrink-0 text-right text-xs text-muted-foreground tabular">{relativeTime(a.at)}</span>
              </>
            )
            return (
              <li key={a.id}>
                {a.href ? (
                  <Link href={a.href} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/60">
                    {row}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2.5">{row}</div>
                )}
              </li>
            )
          })}
        </ul>
      </Card>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-verified" />
        <span className="font-medium text-foreground">Inside Ashcombe network</span>
        <span>·</span>
        <span>
          {MODEL.name} on {MODEL.host}
        </span>
        <span>·</span>
        <span>0 bytes out since Oct 21</span>
        <span>·</span>
        <span>installed {DEPLOYMENT.installedOn.replace(", 2026", "")}</span>
        <span>·</span>
        <span>source reviewed by {DEPLOYMENT.reviewer} {DEPLOYMENT.sourceReviewed.replace(", 2026", "")}</span>
        <Link href={href("/settings?tab=deployment")} className="ml-auto inline-flex items-center gap-1 font-medium text-signal underline-offset-4 hover:underline">
          Deployment details <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
