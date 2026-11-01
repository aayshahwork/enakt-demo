"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { AlertTriangle, ArrowUpRight, Bell, GitMerge, GitPullRequest, Lock, Map as MapIcon, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogDescription, DialogTitle, SheetContent } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ActorAvatar, ActorName, LocalModelBadge, getActor } from "@/components/demo/actor"
import { Card, PageHeader, Stat } from "@/components/demo/page"
import { SourceIcon } from "@/components/demo/source-icon"
import { Truncate } from "@/components/demo/truncate"
import { VerdictPill } from "@/components/demo/verdict-pill"
import { MR, PATEL, SOURCES, SOURCE_BY_ID, SOURCE_TYPE_LABEL, VERDICT_LABEL, VERDICT_URGENCY, href, type Source, type SourceId, type Verdict } from "@/lib/demo/fixtures"
import { fmtInt, relativeTime } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

const CONFLICT_SOURCES: SourceId[] = ["salesforce-crm", "aum-rollup"]

/** Reads ?source= and ?owner= once so the map, palette and sheet can deep-link into Build. */
function ParamsReader({ onSource, onOwner }: { onSource: (id: SourceId) => void; onOwner: (id: string | null) => void }) {
  const params = useSearchParams()
  React.useEffect(() => {
    const source = params.get("source") as SourceId | null
    if (source && SOURCE_BY_ID[source]) onSource(source)
    onOwner(params.get("owner"))
  }, [params, onSource, onOwner])
  return null
}

function MergeRequestCard() {
  const mergeStatus = useDemo((s) => s.mergeStatus)
  const merged = mergeStatus === "merged"
  return (
    <Card className="flex items-center gap-4 px-4 py-3">
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", merged ? "bg-merged-soft text-merged" : "bg-verified-soft text-verified")}>
        {merged ? <GitMerge className="h-4 w-4" /> : <GitPullRequest className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono text-xs text-muted-foreground">MR-{MR.number}</span>
          <span className="truncate font-medium">{MR.title}</span>
          <Badge variant={merged ? "merged" : "verified"} className="gap-1">
            {merged ? <GitMerge className="h-3 w-3" /> : <GitPullRequest className="h-3 w-3" />}
            {merged ? "Merged" : "Open"}
          </Badge>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            opened by <ActorAvatar id={MR.openedBy} size="xs" /> <span className="font-mono text-foreground">{MR.openedBy}</span> <LocalModelBadge />
          </span>
          <span>·</span>
          <span>{relativeTime(MR.openedAt)}</span>
          <span>·</span>
          <span className="tabular">
            <span className="font-medium text-verified">{fmtInt(MR.stats.merged)}</span> merged
          </span>
          <span>·</span>
          <span className="tabular">
            <span className="font-medium text-flagged">{MR.stats.held}</span> held for Dana Ruiz
          </span>
        </div>
      </div>
      <Button asChild size="sm" variant={merged ? "outline" : "signal"}>
        <Link href={href("/build/mr-14")} id="review-mr">
          {merged ? "View" : "Review"} <ArrowUpRight />
        </Link>
      </Button>
    </Card>
  )
}

function NextStep({ s }: { s: Source }) {
  if (!s.task) {
    if (s.verdict === "restricted") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3 w-3 text-merged" /> Excluded by policy
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
  const sides = [PATEL.a, PATEL.b]
  return (
    <div className="flex flex-col">
      <div className="border-b p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-abort-soft text-abort">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base font-semibold leading-6">
              {PATEL.household} · {PATEL.field}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Conflict <span className="font-mono">{PATEL.conflictId}</span> · household <span className="font-mono">{PATEL.id}</span>
            </DialogDescription>
          </div>
          <VerdictPill verdict="conflict" className="mr-6" />
        </div>
      </div>
      <div className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-3">
          {sides.map((v, i) => {
            const src = SOURCE_BY_ID[v.sourceId]
            return (
              <motion.div key={v.source} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut", delay: i * 0.06 }} className="rounded-lg border bg-card p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <SourceIcon type={src.type} size={11} />
                  <span className="truncate font-medium text-foreground">{v.source}</span>
                </div>
                <div className="mt-2 font-display text-[24px] font-medium leading-none tracking-[-0.03em] tabular">{v.value}</div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ActorAvatar id={v.by} size="xs" />
                  <span className="truncate">{getActor(v.by).name}</span>
                  <span className="ml-auto shrink-0 tabular">{v.date}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
        <div className="rounded-lg border border-abort/30 bg-abort-soft p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">{PATEL.note}</span>
            <span className="font-mono text-xs text-abort tabular">Δ {PATEL.delta}</span>
          </div>
          <div className="mt-1 text-muted-foreground">Nothing is guessed. An owner picks the value; the brain records who and when.</div>
        </div>
        <dl className="divide-y text-sm">
          {[
            ["Owners", <span key="o" className="flex -space-x-1.5"><ActorAvatar id="dana" size="sm" className="ring-2 ring-card" /><ActorAvatar id="priya" size="sm" className="ring-2 ring-card" /></span>],
            ["Next step", <span key="n" className="flex items-center gap-2"><ActorAvatar id="dana" size="xs" /><span className="flex-1">Resolve Patel household AUM with Priya Nair</span><span className="text-xs text-muted-foreground tabular">due Nov 3</span></span>],
            ["Downstream", "Billing run reads AUM_Rollup at quarter end"],
          ].map(([k, v]) => (
            <div key={k as string} className="grid grid-cols-[100px_1fr] gap-3 py-2">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="min-w-0">{v}</dd>
            </div>
          ))}
        </dl>
        <Separator />
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => toast("Reminders sent", { description: "Dana Ruiz and Priya Nair were asked to pick a value for HH-00318 by Nov 3." })}>
            <Bell /> Remind owners
          </Button>
          <Button asChild variant="signal" className="flex-1" id="open-mr-14">
            <Link href={href("/build/mr-14")}>
              <GitPullRequest /> Open MR-14
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
            <DialogDescription className="text-xs text-muted-foreground">{SOURCE_TYPE_LABEL[s.type]}</DialogDescription>
          </div>
          <VerdictPill verdict={verdict} className="mr-6" />
        </div>
      </div>
      <div className="space-y-5 p-5">
        <div className={cn("rounded-lg border p-3 text-sm", verdict === "inbrain" ? "border-verified/30 bg-verified-soft" : verdict === "restricted" ? "border-merged/30 bg-merged-soft" : "bg-muted")}>
          <div className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Verdict</div>
          <div className="font-medium">{VERDICT_LABEL[verdict]}</div>
          <div className="mt-1 text-muted-foreground">{s.reason}</div>
        </div>
        <dl className="divide-y text-sm">
          {[
            [
              "Owner",
              s.ownerId ? (
                <span key="o" className="flex items-center gap-2"><ActorAvatar id={s.ownerId} size="xs" /><ActorName id={s.ownerId} withRole /></span>
              ) : (
                <Badge key="o" variant="abort">No owner · open question for Chris Hale</Badge>
              ),
            ],
            ["Next step", <NextStep key="n" s={s} />],
            ["Records", `${fmtInt(s.records)} ${s.recordNoun}`],
            ["Location", <span key="l" className="break-all font-mono text-xs">{s.location}</span>],
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

export default function BuildPage() {
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
    return [...list].sort((a, b) => VERDICT_URGENCY[verdictOf(a)] - VERDICT_URGENCY[verdictOf(b)] || SOURCES.indexOf(a) - SOURCES.indexOf(b))
  }, [owner, verdictOf])

  const count = (v: Verdict) => SOURCES.filter((s) => s.verdict === v).length
  const selectedSource = selected ? SOURCE_BY_ID[selected] : null
  const isConflict = selected ? CONFLICT_SOURCES.includes(selected) : false

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <React.Suspense fallback={null}>
        <ParamsReader onSource={setSelected} onOwner={setOwner} />
      </React.Suspense>

      <PageHeader title="Build" description="Every source scored on whether it is safe to merge. Cleanup goes to the person who owns the data, never to Enakt." />

      <div className="grid grid-cols-4 gap-4">
        <Stat label="Conflicts" value={count("conflict")} hint="two sources disagree" accent="var(--abort)" />
        <Stat label="Stale" value={count("stale")} hint="owner to confirm" accent="var(--stale)" />
        <Stat label="Unverified" value={count("unverified")} hint="no owner yet" accent="var(--gap)" />
        <Stat label="Cleaning" value={count("cleaning")} hint="in progress" accent="var(--flagged)" />
      </div>

      <MergeRequestCard />

      {owner && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filtered by</span>
          <button
            onClick={() => {
              setOwner(null)
              router.replace(href("/build"))
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
                        <span className="block text-[11px] text-muted-foreground">{SOURCE_TYPE_LABEL[s.type]}</span>
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
                    {s.ownerId ? (
                      <span className="flex items-center gap-2">
                        <ActorAvatar id={s.ownerId} size="xs" />
                        <Truncate className="text-sm">{getActor(s.ownerId).name}</Truncate>
                      </span>
                    ) : (
                      <Badge variant="abort">No owner</Badge>
                    )}
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
