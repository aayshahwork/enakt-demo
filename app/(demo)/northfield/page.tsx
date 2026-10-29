"use client"

import Link from "next/link"
import { ArrowRight, AlertTriangle, Clock, HelpCircle, GitPullRequest } from "lucide-react"
import { Card, CardHeader, PageHeader, Stat } from "@/components/demo/page"
import { ActorAvatar, ActorName } from "@/components/demo/actor"
import { SourceIcon } from "@/components/demo/source-icon"
import { VerdictPill } from "@/components/demo/verdict-pill"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SOURCES, SOURCE_COUNTS, MR } from "@/lib/demo/fixtures"
import { absoluteTime, relativeTime } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

const ATTENTION_ORDER = ["conflict", "stale", "unverified"] as const

export default function OverviewPage() {
  const { state, activity } = useDemo()
  const merged = state.mergeStatus === "merged"
  const attention = ATTENTION_ORDER.flatMap((v) => SOURCES.filter((s) => s.verdict === v))
  const governed = merged ? 4 : 1

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <PageHeader
        title="Overview"
        description="Everything Northfield runs on, mapped and scored. Nothing merges without an owner and a reviewer."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/northfield/merge-requests/12">
              <GitPullRequest /> {merged ? "MR-12 merged" : "Review MR-12"}
            </Link>
          </Button>
        }
      />

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Consolidated into one system</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {governed} of {SOURCE_COUNTS.total} sources governed by the Unified Client Record
            </div>
          </div>
          <div className={cn("font-display text-3xl font-medium tracking-[-0.03em] tabular", merged ? "text-merged" : "text-signal")}>{state.progress}%</div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full transition-[width] duration-700", merged ? "bg-merged" : "bg-signal")} style={{ width: `${state.progress}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Weighted by record count. Restricted sources count once mapped.</span>
          <span>{merged ? "Updated just now" : "MR-12 would bring this to 41%"}</span>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Sources" value={SOURCE_COUNTS.total} hint="mapped" />
        <Stat label="Owners" value={SOURCE_COUNTS.owners} hint="5 confirmed" />
        <Stat label="Ready" value={SOURCE_COUNTS.ready} hint={merged ? "3 merged" : "3 in MR-12"} accent="var(--verified)" />
        <Stat label="Awaiting review" value={merged ? 41 : SOURCE_COUNTS.awaitingReview} hint="records held" accent="var(--flagged)" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                Needs attention
                <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground tabular">{attention.length}</span>
              </span>
            }
            action={
              <Link href="/northfield/sources" className="text-xs text-muted-foreground hover:text-foreground">
                All sources
              </Link>
            }
          />
          <ul className="divide-y">
            {attention.map((s) => (
              <li key={s.slug}>
                <Link href={`/northfield/sources/${s.slug}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60">
                  <SourceIcon type={s.type} size={16} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{s.name}</span>
                      <VerdictPill verdict={s.verdict} icon={false} />
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{s.reason}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4 border-t px-4 py-2.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-abort" /> {SOURCE_COUNTS.conflicts} conflicts</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3 text-flagged" /> {SOURCE_COUNTS.stale} stale</span>
            <span className="inline-flex items-center gap-1"><HelpCircle className="h-3 w-3 text-gap" /> {SOURCE_COUNTS.unverified} unverified</span>
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader
            title="Recent activity"
            action={
              <Link href="/northfield/activity" className="text-xs text-muted-foreground hover:text-foreground">
                View all
              </Link>
            }
          />
          <ul className="divide-y">
            {activity.slice(0, 8).map((e) => (
              <li key={e.id} className="flex items-start gap-3 px-4 py-2.5">
                <ActorAvatar id={e.actorId} size="sm" className="mt-0.5" />
                <div className="min-w-0 flex-1 text-sm leading-5">
                  <ActorName id={e.actorId} /> <span className="text-muted-foreground">{e.text}</span>
                  {e.href && (
                    <Link href={e.href} className="ml-1 text-signal underline-offset-2 hover:underline">
                      View
                    </Link>
                  )}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="shrink-0 text-xs text-muted-foreground tabular">{relativeTime(e.at)}</span>
                  </TooltipTrigger>
                  <TooltipContent>{absoluteTime(e.at)}</TooltipContent>
                </Tooltip>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="flex items-center gap-4 p-4">
        <ActorAvatar id={MR.openedBy} size="md" />
        <div className="min-w-0 flex-1">
          <div className="text-sm">
            <span className="font-mono text-xs text-muted-foreground">MR-{MR.number}</span> <span className="font-medium">{MR.title}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Opened by <ActorName id={MR.openedBy} className="text-foreground" /> · {MR.stats.in.toLocaleString()} in · {MR.stats.merged.toLocaleString()} merged · {MR.stats.held} held for Dana Ruiz
          </div>
        </div>
        <Button asChild size="sm" variant={merged ? "merged" : "signal"}>
          <Link href="/northfield/merge-requests/12">{merged ? "Merged" : "Review"}</Link>
        </Button>
      </Card>
    </div>
  )
}
