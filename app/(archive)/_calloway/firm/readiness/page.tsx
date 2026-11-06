"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { AlertTriangle, ArrowUpRight, Bell, GitPullRequest, Lock, Map as MapIcon, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogDescription, DialogTitle, SheetContent } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ActorAvatar, ActorName, getActor } from "@/components/demo/actor"
import { Card, PageHeader, Stat } from "@/components/demo/page"
import { SourceIcon } from "@/components/demo/source-icon"
import { Truncate } from "@/components/demo/truncate"
import { VerdictPill } from "@/components/demo/verdict-pill"
import { CR, LANE_BY_ID, REVENUE, SOURCES, SOURCE_BY_ID, SOURCE_TYPE_LABEL, VERDICT_LABEL, VERDICT_URGENCY, href, type Source, type SourceId, type Verdict } from "@/lib/demo/fixtures"
import { fmtInt, relativeTime } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

/** Reads ?source= and ?owner= once so the map, palette and home can deep-link in. */
function ParamsReader({ onSource, onOwner }: { onSource: (id: SourceId) => void; onOwner: (id: string | null) => void }) {
  const params = useSearchParams()
  React.useEffect(() => {
    const source = params.get("source") as SourceId | null
    if (source && SOURCE_BY_ID[source]) onSource(source)
    onOwner(params.get("owner"))
  }, [params, onSource, onOwner])
  return null
}

function NextStep({ s }: { s: Source }) {
  if (!s.task) {
    if (s.verdict === "restricted") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3 w-3 text-abort" /> Excluded by policy
        </span>
      )
    }
    return <span className="text-xs text-muted-foreground">Nothing needed</span>
  }
  return (
    <span className="flex items-center gap-2">
      <ActorAvatar id={s.task.assignee} size="xs" />
      <span className="min-w-0 flex-1 truncate text-sm">{s.task.text}</span>
      <span className="shrink-0 text-xs text-muted-foreground tabular">due {s.task.due}</span>
    </span>
  )
}

function ConflictSheet() {
  const sides = [REVENUE.a, REVENUE.b]
  return (
    <div className="flex flex-col">
      <div className="border-b p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-abort-soft text-abort">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base font-semibold leading-6">Northline · {REVENUE.metric} ({REVENUE.period})</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Held value <span className="font-mono">{REVENUE.id}</span> · Atlas data room
            </DialogDescription>
          </div>
          <VerdictPill verdict="conflict" className="mr-6" />
        </div>
      </div>
      <div className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-3">
          {sides.map((v, i) => (
            <motion.div key={v.loc} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut", delay: i * 0.06 }} className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <SourceIcon type="datasite" size={11} />
                <span className="truncate font-medium text-foreground">{v.source}</span>
              </div>
              <div className="mt-2 font-display text-[26px] font-medium leading-none tracking-[-0.03em] tabular">{v.value}</div>
              <div className="mt-2 truncate font-mono text-[10px] text-muted-foreground" title={v.file}>
                {v.file}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <ActorAvatar id={v.by} size="xs" />
                <span className="truncate">{getActor(v.by).name.split(" ")[0]}</span>
                <span className="ml-auto shrink-0 tabular">{v.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="rounded-lg border border-abort/30 bg-abort-soft p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">{REVENUE.a.value} ≠ {REVENUE.b.value}</span>
            <span className="font-mono text-xs text-abort tabular">Δ {REVENUE.delta}</span>
          </div>
          <div className="mt-1 text-foreground">{REVENUE.note}</div>
          <div className="mt-1 text-muted-foreground">The memo leads with the P&amp;L figure and flags the CIM. Nina picks the value; the audit log records who and when.</div>
        </div>
        <dl className="divide-y text-sm">
          {[
            ["Owners", <span key="o" className="flex -space-x-1.5"><ActorAvatar id="tom" size="sm" className="ring-2 ring-card" /><ActorAvatar id="nina" size="sm" className="ring-2 ring-card" /></span>],
            ["Next step", <span key="n" className="flex items-center gap-2"><ActorAvatar id={REVENUE.task.assignee} size="xs" /><span className="flex-1">{REVENUE.task.text}</span><span className="text-xs text-muted-foreground tabular">due {REVENUE.task.due}</span></span>],
            ["Downstream", "IC memo section 4 · revenue line shows both values until resolved"],
          ].map(([k, v]) => (
            <div key={k as string} className="grid grid-cols-[100px_1fr] gap-3 py-2">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="min-w-0">{v}</dd>
            </div>
          ))}
        </dl>
        <Separator />
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => toast("Reminder sent", { description: `Nina Alvarez was asked to resolve ${REVENUE.id} (CIM p.14 vs Monthly P&L F42) by ${REVENUE.task.due}.` })}>
            <Bell /> Remind Nina
          </Button>
          <Button asChild variant="signal" className="flex-1" id="open-cr-7">
            <Link href={href("/connections/cr-7")}>
              <GitPullRequest /> Open CR-{CR.number}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function SourceSheet({ source: s, verdict }: { source: Source; verdict: Verdict }) {
  return (
    <div className="flex flex-col">
      <div className="border-b p-5">
        <div className="flex items-start gap-3">
          <SourceIcon type={s.type} size={22} />
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base font-semibold leading-6">{s.name}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">{SOURCE_TYPE_LABEL[s.type]} · {LANE_BY_ID[s.lane].label}</DialogDescription>
          </div>
          <VerdictPill verdict={verdict} className="mr-6" />
        </div>
      </div>
      <div className="space-y-5 p-5">
        <div className={cn("rounded-lg border p-3 text-sm", verdict === "ready" ? "border-verified/30 bg-verified-soft" : verdict === "restricted" ? "border-abort/30 bg-abort-soft" : verdict === "attention" ? "border-flagged/30 bg-flagged-soft" : "bg-muted")}>
          <div className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Verdict</div>
          <div className="font-medium">{VERDICT_LABEL[verdict]}</div>
          <div className="mt-1 text-muted-foreground">{s.reason}</div>
        </div>
        <dl className="divide-y text-sm">
          {[
            ["Owner", <span key="o" className="flex items-center gap-2"><ActorAvatar id={s.ownerId} size="xs" /><ActorName id={s.ownerId} withRole /></span>],
            ["Next step", <NextStep key="n" s={s} />],
            ["Records", `${fmtInt(s.records)} ${s.recordNoun}`],
            ["Last sync", `synced ${relativeTime(s.lastSync)}`],
            ["Location", <span key="l" className="break-all font-mono text-xs" title={s.location}>{s.location}</span>],
            ["Enforcement", <span key="e" className="font-mono text-xs">{s.enforcement}</span>],
          ].map(([k, v]) => (
            <div key={k as string} className="grid grid-cols-[100px_1fr] gap-3 py-2">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="min-w-0">{v}</dd>
            </div>
          ))}
        </dl>
        <Separator />
        <Button asChild variant="outline" className="w-full">
          <Link href={href(`/map?source=${s.id}`)}>
            <MapIcon /> View on map <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default function ReadinessPage() {
  const router = useRouter()
  const nodes = useDemo((s) => s.nodes)
  const [selected, setSelected] = React.useState<SourceId | null>(null)
  const [owner, setOwner] = React.useState<string | null>(null)

  const verdictOf = React.useCallback(
    (s: Source): Verdict => {
      const v = nodes[s.id]?.verdict
      return v && v !== "unchecked" ? v : s.verdict
    },
    [nodes],
  )

  const rows = React.useMemo(() => {
    const list = SOURCES.filter((s) => !owner || s.ownerId === owner || s.task?.assignee === owner)
    return [...list].sort((a, b) => VERDICT_URGENCY[verdictOf(a)] - VERDICT_URGENCY[verdictOf(b)] || a.n - b.n)
  }, [owner, verdictOf])

  const count = (v: Verdict) => SOURCES.filter((s) => s.verdict === v).length
  const selectedSource = selected ? SOURCE_BY_ID[selected] : null
  const isConflict = selected === "atlas-dataroom"

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <React.Suspense fallback={null}>
        <ParamsReader onSource={setSelected} onOwner={setOwner} />
      </React.Suspense>

      <PageHeader title="Readiness" description="Every source scored on whether an agent can use it: ready, needs work, held on a conflict, or red by policy. Cleanup goes to the person who owns the data." />

      <div className="grid grid-cols-4 gap-4">
        <Stat label="Conflict" value={count("conflict")} hint="one value held" accent="var(--abort)" />
        <Stat label="Needs work" value={count("attention")} hint="owner has a task" accent="var(--flagged)" />
        <Stat label="Ready" value={count("ready")} hint="owner confirmed" accent="var(--verified)" />
        <Stat label="Red by policy" value={count("restricted")} hint="no agent may read" accent="var(--abort)" />
      </div>

      {owner && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filtered by</span>
          <button
            onClick={() => {
              setOwner(null)
              router.replace(href("/readiness"))
            }}
            className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs font-medium shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Clear owner filter"
          >
            <ActorAvatar id={owner} size="xs" /> Owner: {getActor(owner).name} <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </motion.div>
      )}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[240px]">Source</TableHead>
              <TableHead className="w-[120px]">Verdict</TableHead>
              <TableHead>Why</TableHead>
              <TableHead className="w-[150px]">Owner</TableHead>
              <TableHead className="w-[300px]">Next step</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => {
              const v = verdictOf(s)
              return (
                <TableRow
                  key={s.id}
                  onClick={() => setSelected(s.id)}
                  className={cn("cursor-pointer", selected === s.id && "bg-accent/60")}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setSelected(s.id)
                    }
                  }}
                >
                  <TableCell>
                    <span className="flex items-center gap-2.5">
                      <SourceIcon type={s.type} size={14} />
                      <span className="min-w-0">
                        <Truncate className="text-sm font-medium">{s.name}</Truncate>
                        <span className="block text-[11px] text-muted-foreground">
                          {SOURCE_TYPE_LABEL[s.type]} · {LANE_BY_ID[s.lane].label}
                        </span>
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <VerdictPill verdict={v} />
                  </TableCell>
                  <TableCell className="w-[300px] min-w-[220px]">
                    <span className="line-clamp-2 text-[13px] leading-5 text-muted-foreground" title={s.reason}>
                      {s.reason}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <ActorAvatar id={s.ownerId} size="xs" />
                      <Truncate className="text-sm">{getActor(s.ownerId).name}</Truncate>
                    </span>
                  </TableCell>
                  <TableCell>
                    <NextStep s={s} />
                  </TableCell>
                </TableRow>
              )
            })}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  Nothing assigned to this person.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
          <span>
            {rows.length} of {SOURCES.length} sources · sorted by urgency
          </span>
          <span>0 rows read to score these</span>
        </div>
      </Card>

      <Dialog open={!!selectedSource} onOpenChange={(o) => !o && setSelected(null)} modal={false}>
        <SheetContent className="top-14 overflow-y-auto" overlay={false}>
          {selectedSource && (isConflict ? <ConflictSheet /> : <SourceSheet source={selectedSource} verdict={verdictOf(selectedSource)} />)}
        </SheetContent>
      </Dialog>
    </div>
  )
}
