"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpRight, Eye, EyeOff, Hammer, Lock, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogDescription, DialogTitle, SheetContent } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ActorAvatar, ActorName } from "@/components/demo/actor"
import { useCanvasSelection } from "@/components/demo/canvas-context"
import { SourceIcon } from "@/components/demo/source-icon"
import { VerdictPill, VERDICT_COLOR } from "@/components/demo/verdict-pill"
import { POLICIES, SOURCE_BY_ID, SOURCE_TYPE_LABEL, VERDICT_LABEL, VIEWERS, VIEW_BANNER, VIEW_SCOPE, WORKFLOWS, href, type Source, type SourceId, type Verdict, type Viewer } from "@/lib/demo/fixtures"
import { absoluteTime, fmtInt, relativeTime } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

const LEGEND: Verdict[] = ["inbrain", "ready", "cleaning", "conflict", "stale", "unverified", "restricted"]

/** Reads ?source= once so the command palette can deep-link a node. */
function SourceParam() {
  const params = useSearchParams()
  const { setSelected } = useCanvasSelection()
  const nodes = useDemo((s) => s.nodes)
  React.useEffect(() => {
    const id = params.get("source") as SourceId | null
    if (id && nodes[id]) setSelected(id)
  }, [params, nodes, setSelected])
  return null
}

function Toolbar() {
  const viewAs = useDemo((s) => s.viewAs)
  const setViewAs = useDemo((s) => s.setViewAs)
  const nodes = useDemo((s) => s.nodes)
  const intakeDone = useDemo((s) => s.intakePhase === "done")
  const { hiddenVerdicts, toggleVerdict } = useCanvasSelection()
  const counts = React.useMemo(() => {
    const c: Partial<Record<Verdict, number>> = {}
    for (const n of Object.values(nodes)) if (n && !n.placeholder) c[n.verdict] = (c[n.verdict] ?? 0) + 1
    return c
  }, [nodes])
  const scope = VIEW_SCOPE[viewAs]
  const visibleCount = Object.keys(nodes).filter((id) => scope === "all" || scope.includes(id as SourceId)).length

  return (
    <div className="absolute inset-x-4 top-3 z-10 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-lg border bg-card/95 px-3.5 py-2 shadow-sm backdrop-blur">
          <h1 className="font-display text-[18px] font-medium leading-6 tracking-[-0.02em]">Map</h1>
          <p className="text-xs text-muted-foreground">
            {intakeDone ? `${visibleCount} of 12 sources visible` : "Built from interviews, not from reading data."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2.5 rounded-md border bg-card/95 px-3 py-1.5 text-[11px] shadow-sm backdrop-blur lg:flex">
            {LEGEND.map((v) => (
              <button key={v} onClick={() => toggleVerdict(v)} className={cn("inline-flex items-center gap-1.5 transition-opacity", hiddenVerdicts.has(v) && "opacity-35 line-through")} aria-pressed={!hiddenVerdicts.has(v)}>
                <span className="h-2 w-2 rounded-full" style={{ background: VERDICT_COLOR[v] }} />
                {VERDICT_LABEL[v]}
                {counts[v] ? <span className="font-mono text-muted-foreground tabular">{counts[v]}</span> : null}
              </button>
            ))}
          </div>
          <Select value={viewAs} onValueChange={(v) => setViewAs(v as Viewer)}>
            <SelectTrigger className="h-8 w-[232px] bg-card/95 text-xs shadow-sm backdrop-blur" aria-label="View as">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Eye className="h-3.5 w-3.5" /> View as
              </span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {VIEWERS.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  <span className="inline-flex items-center gap-2">
                    <ActorAvatar id={v.id} size="xs" />
                    <span className={cn(v.id === "marcus-assistant" && "font-mono")}>{v.label}</span>
                    <span className="text-[11px] text-muted-foreground">{v.sub.split(" · ")[1]}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <AnimatePresence>
        {VIEW_BANNER[viewAs] && (
          <motion.div
            key={viewAs}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex items-center gap-2 self-start rounded-md border border-merged/40 bg-merged-soft px-3 py-1.5 text-xs font-medium text-merged shadow-sm"
          >
            <EyeOff className="h-3.5 w-3.5" /> {VIEW_BANNER[viewAs]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function EmptyMap() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="rounded-xl border bg-card px-6 py-5 text-center shadow-sm">
        <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-signal-soft text-signal">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="text-sm font-medium">No sources on the map yet</div>
        <div className="mt-0.5 max-w-[300px] text-xs text-muted-foreground">Intake builds the map from interviews. Run it and come back; the canvas carries over.</div>
        <Button asChild size="sm" variant="signal" className="mt-3">
          <Link href={href("/intake")}>Go to Intake</Link>
        </Button>
      </div>
    </div>
  )
}

function SourceSheet({ source: s }: { source: Source }) {
  const state = useDemo((st) => st.nodes[s.id])
  const verdict = state?.verdict ?? "unchecked"
  const policies = POLICIES.filter((p) => p.governs.includes(s.id))
  const workflows = WORKFLOWS.filter((w) => w.sources.includes(s.id))
  const rows: [string, React.ReactNode][] = [
    [
      "Owner",
      s.ownerId ? (
        <span key="o" className="flex items-center gap-2">
          <ActorAvatar id={s.ownerId} size="xs" />
          <ActorName id={s.ownerId} withRole />
        </span>
      ) : (
        <Badge key="o" variant="abort">
          No owner · open question for Chris Hale
        </Badge>
      ),
    ],
    ["Type", SOURCE_TYPE_LABEL[s.type]],
    ["Records", `${fmtInt(s.records)} ${s.recordNoun}`],
    ["Update cadence", s.cadence],
    ["Last edit", `${absoluteTime(s.lastEdit)} · ${relativeTime(s.lastEdit)}`],
    ["Location", <span key="l" className="break-all font-mono text-xs">{s.location}</span>],
    ["Feeds", s.feeds.length ? s.feeds.join(", ") : <span className="text-muted-foreground">Nothing downstream</span>],
    ["Workflows", workflows.length ? workflows.map((w) => w.name).join(", ") : <span className="text-muted-foreground">None recorded</span>],
  ]
  return (
    <div className="flex flex-col">
      <div className="border-b p-5">
        <div className="flex items-start gap-3">
          <SourceIcon type={s.type} size={22} />
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base font-semibold leading-6">{s.name}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">{SOURCE_TYPE_LABEL[s.type]}</DialogDescription>
          </div>
          <VerdictPill verdict={verdict} className="mr-6" />
        </div>
      </div>
      <div className="space-y-5 p-5">
        <div className={cn("rounded-lg border p-3 text-sm", verdict === "inbrain" ? "border-verified/30 bg-verified-soft" : verdict === "conflict" ? "border-abort/30 bg-abort-soft" : verdict === "restricted" ? "border-merged/30 bg-merged-soft" : "bg-muted")}>
          <div className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Verdict</div>
          <div className="font-medium">{VERDICT_LABEL[verdict]}</div>
          <div className="mt-1 text-muted-foreground">{verdict === "unchecked" ? "Readiness pass has not run on this source yet." : s.reason}</div>
        </div>
        {policies.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground">Policies on this source</div>
            {policies.map((p) => (
              <div key={p.id} className="flex items-start gap-2 rounded-md border border-merged/30 bg-merged-soft/50 px-2.5 py-1.5 text-xs">
                <Lock className="mt-0.5 h-3 w-3 shrink-0 text-merged" />
                <span>
                  <span className="font-medium">{p.rule}.</span> <span className="text-muted-foreground">{p.sourceLabel}, {p.date}. Enforced at the data layer.</span>
                </span>
              </div>
            ))}
          </div>
        )}
        <dl className="divide-y text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[110px_1fr] gap-3 py-2">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="min-w-0">{v}</dd>
            </div>
          ))}
        </dl>
        {s.task && (
          <div className="rounded-lg border p-3 text-sm">
            <div className="mb-1 text-xs font-medium text-muted-foreground">Next step</div>
            <div className="flex items-center gap-2">
              <ActorAvatar id={s.task.assignee} size="xs" />
              <span className="flex-1">{s.task.text}</span>
              <span className="text-xs text-muted-foreground tabular">due {s.task.due}</span>
            </div>
          </div>
        )}
        <Separator />
        <Button asChild variant="outline" className="w-full">
          <Link href={href(`/build?source=${s.id}`)}>
            <Hammer /> Open in Build <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default function MapPage() {
  const { selected, setSelected } = useCanvasSelection()
  const hasNodes = useDemo((s) => Object.keys(s.nodes).length > 0)
  const source = selected ? SOURCE_BY_ID[selected] : null
  return (
    <>
      <React.Suspense fallback={null}>
        <SourceParam />
      </React.Suspense>
      <Toolbar />
      {!hasNodes && <EmptyMap />}
      <Dialog open={!!source} onOpenChange={(o) => !o && setSelected(null)} modal={false}>
        <SheetContent
          className="top-14 overflow-y-auto"
          overlay={false}
          onInteractOutside={(e) => {
            if ((e.target as HTMLElement)?.closest?.(".react-flow__node")) e.preventDefault()
          }}
        >
          {source && <SourceSheet source={source} />}
        </SheetContent>
      </Dialog>
    </>
  )
}
