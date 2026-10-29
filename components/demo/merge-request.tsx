"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, ArrowLeft, Check, CheckCircle2, GitMerge, GitPullRequest, Loader2, MessageSquare, ShieldCheck, Bot, ArrowRight, Minus, Plus, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, UnderlineTabsList, UnderlineTabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/demo/page"
import { ActorAvatar, ActorName, ModelBadge } from "@/components/demo/actor"
import { SourceIcon } from "@/components/demo/source-icon"
import { CONSOLIDATION, MR, MR_TIMELINE, OKAFOR_HOLD, OTHER_HELD, PATEL_COLLAPSE, SOURCE_BY_SLUG } from "@/lib/demo/fixtures"
import { absoluteTime, fmtInt, relativeTime } from "@/lib/demo/format"
import { runProgress, TIMING, wait } from "@/lib/demo/sim"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

export function MergeRequestDetail() {
  const { state, dispatch } = useDemo()
  const merged = state.mergeStatus === "merged"
  const merging = state.mergeStatus === "merging"
  const [pct, setPct] = React.useState(0)
  const abort = React.useRef<AbortController | null>(null)
  React.useEffect(() => () => abort.current?.abort(), [])

  const approve = async () => {
    if (merging || merged) return
    const ac = new AbortController()
    abort.current = ac
    dispatch({ type: "merge:status", status: "merging" })
    try {
      await runProgress(TIMING.mergeProgressMs, setPct, { signal: ac.signal })
      dispatch({ type: "merge:status", status: "merged" })
      dispatch({ type: "progress", value: CONSOLIDATION.after })
      dispatch({
        type: "activity:add",
        entry: { id: "merged-12", at: new Date("2026-10-29T16:41:00-04:00"), actorId: "dana", text: "approved and merged MR-12 · 1,197 records into Unified Client Record, 41 held", href: "/northfield/merge-requests/12", kind: "merge" },
      })
      toast.success("MR-12 merged", { description: "1,197 records merged. 41 held for your review. Consolidation 34% → 41%." })
      await wait(200, ac.signal)
    } catch {
      /* aborted */
    }
  }

  const timeline = merged
    ? [...MR_TIMELINE, { id: "t6", at: new Date("2026-10-29T16:41:00-04:00"), actor: "dana", text: "approved and merged this request" }]
    : MR_TIMELINE

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 p-6">
      <Link href="/northfield/merge-requests" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Merge requests
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-[22px] font-medium leading-7 tracking-[-0.02em]">
            <span className="text-muted-foreground">MR-{MR.number}</span> · {MR.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <AnimatePresence mode="wait" initial={false}>
              {merged ? (
                <motion.span key="merged" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}>
                  <Badge variant="merged" className="h-6 gap-1 px-2.5 text-xs">
                    <GitMerge className="h-3.5 w-3.5" /> Merged
                  </Badge>
                </motion.span>
              ) : (
                <motion.span key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Badge variant="verified" className="h-6 gap-1 px-2.5 text-xs">
                    <GitPullRequest className="h-3.5 w-3.5" /> Open
                  </Badge>
                </motion.span>
              )}
            </AnimatePresence>
            <span className="inline-flex items-center gap-1.5">
              <ActorAvatar id={MR.openedBy} size="xs" /> <ActorName id={MR.openedBy} withModel={false} className="text-foreground" /> opened {relativeTime(MR.openedAt)}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5">
              reviewer <ActorAvatar id={MR.reviewer} size="xs" /> <ActorName id={MR.reviewer} className="text-foreground" />
            </span>
            <span>·</span>
            <span className="font-mono text-xs">
              {MR.branch} <ArrowRight className="inline h-3 w-3" /> {MR.target}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!merged && (
            <Button variant="outline" size="sm" onClick={() => toast("Comment posted (demo)", { description: "merge-agent-01 will reply in the Conversation tab." })}>
              <MessageSquare /> Comment
            </Button>
          )}
          <ApproveButton status={state.mergeStatus} pct={pct} onClick={approve} />
        </div>
      </div>

      <div className="grid grid-cols-4 overflow-hidden rounded-xl border bg-card shadow-sm">
        {[
          { label: "Records in", value: MR.stats.in, hint: "from 3 sources" },
          { label: "Merged", value: MR.stats.merged, hint: "matched a household", color: "text-verified" },
          { label: "Duplicates collapsed", value: MR.stats.duplicates, hint: "same person, 2+ sources", color: "text-signal" },
          { label: "Held for review", value: MR.stats.held, hint: "routed to Dana Ruiz", color: "text-flagged" },
        ].map((s, i) => (
          <div key={s.label} className={cn("px-4 py-3", i > 0 && "border-l")}>
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className={cn("mt-0.5 font-display text-2xl font-medium tracking-[-0.03em] tabular", s.color)}>{fmtInt(s.value)}</div>
            <div className="text-[11px] text-muted-foreground">{s.hint}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="conversation">
        <UnderlineTabsList>
          <UnderlineTabsTrigger value="conversation">
            Conversation <span className="rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground tabular">{timeline.length + 1}</span>
          </UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="changes">
            Changes <span className="rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground tabular">3</span>
          </UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="checks">
            Checks
            <span className="inline-flex items-center gap-0.5 text-[11px]">
              <CheckCircle2 className="h-3 w-3 text-verified" /> 3 <AlertTriangle className="ml-1 h-3 w-3 text-flagged" /> 1
            </span>
          </UnderlineTabsTrigger>
        </UnderlineTabsList>

        <TabsContent value="conversation">
          <Conversation timeline={timeline} merged={merged} />
        </TabsContent>
        <TabsContent value="changes">
          <Changes />
        </TabsContent>
        <TabsContent value="checks">
          <Checks />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ApproveButton({ status, pct, onClick }: { status: "open" | "merging" | "merged"; pct: number; onClick: () => void }) {
  if (status === "merged") {
    return (
      <Button variant="merged" size="sm" disabled className="disabled:opacity-100">
        <GitMerge /> Merged
      </Button>
    )
  }
  if (status === "merging") {
    return (
      <Button variant="signal" size="sm" disabled className="relative overflow-hidden disabled:opacity-100">
        <span className="absolute inset-y-0 left-0 bg-white/20 transition-[width] duration-75 dark:bg-ink/15" style={{ width: `${pct}%` }} />
        <Loader2 className="animate-spin" /> Merging {pct}%
      </Button>
    )
  }
  return (
    <Button variant="verified" size="sm" onClick={onClick} id="approve-merge">
      <Check /> Approve and merge
    </Button>
  )
}

function Conversation({ timeline, merged }: { timeline: { id: string; at: Date; actor: string; text: string }[]; merged: boolean }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="space-y-4">
        <Card>
          <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5 text-sm">
            <ActorAvatar id="merge-agent-01" size="sm" />
            <ActorName id="merge-agent-01" />
            <span className="text-muted-foreground">commented {relativeTime(MR.openedAt)}</span>
            <Badge variant="outline" className="ml-auto gap-1">
              <Bot className="h-3 w-3" /> Agent summary
            </Badge>
          </div>
          <div className="space-y-3 px-4 py-4 text-sm leading-6">
            <p>{MR.summary}</p>
            <div className="rounded-md border bg-muted/40 p-3 text-xs">
              <div className="mb-1.5 font-medium">Sources in this request</div>
              <ul className="space-y-1">
                {MR.sources.map((slug) => {
                  const s = SOURCE_BY_SLUG[slug]
                  return (
                    <li key={slug} className="flex items-center gap-2">
                      <SourceIcon type={s.type} size={11} />
                      <Link href={`/northfield/sources/${slug}`} className="font-medium hover:text-signal">{s.name}</Link>
                      <span className="text-muted-foreground">· {fmtInt(s.records)} {s.recordNoun} · owner confirmed</span>
                    </li>
                  )
                })}
              </ul>
            </div>
            <p className="text-muted-foreground">
              I did not read AUM_Rollup.xlsx or Salesforce CRM for this request. Both carry an open conflict on 40 households and are not ready. When that conflict is resolved by an owner, I will open a separate request.
            </p>
          </div>
        </Card>

        <ol className="relative ml-4 space-y-4 border-l pl-6">
          {timeline.map((t) => (
            <li key={t.id} className="relative text-sm">
              <span className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border bg-card">
                {t.text.includes("merged") ? <GitMerge className="h-3 w-3 text-merged" /> : t.text.includes("checks") ? <ShieldCheck className="h-3 w-3 text-verified" /> : t.text.includes("comment") ? <MessageSquare className="h-3 w-3 text-muted-foreground" /> : <GitPullRequest className="h-3 w-3 text-muted-foreground" />}
              </span>
              <ActorName id={t.actor} /> <span className="text-muted-foreground">{t.text}</span>
              <span className="ml-2 text-xs text-muted-foreground tabular">{absoluteTime(t.at)}</span>
            </li>
          ))}
        </ol>

        {merged && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-xl border border-merged/40 bg-merged-soft px-4 py-3 text-sm">
            <GitMerge className="h-4 w-4 text-merged" />
            <span>
              <span className="font-medium">Dana Ruiz</span> merged 1,197 records into <span className="font-mono text-xs">unified-client-record</span>. 41 records are waiting in your review queue.
            </span>
          </motion.div>
        )}
      </div>

      <aside className="space-y-4 text-sm">
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">Reviewer</div>
          <div className="flex items-center gap-2">
            <ActorAvatar id="dana" size="sm" /> <ActorName id="dana" withRole />
            {merged && <Check className="h-4 w-4 text-merged" />}
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">Author</div>
          <div className="flex items-center gap-2">
            <ActorAvatar id="merge-agent-01" size="sm" /> <ActorName id="merge-agent-01" />
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">Model</div>
          <ModelBadge model="Claude" /> <span className="font-mono text-xs text-muted-foreground">claude-fable-5-1</span>
        </div>
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">Policy</div>
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Lock className="mt-0.5 h-3 w-3" /> Agents cannot approve. Held records never auto-resolve.
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">Participants</div>
          <div className="flex -space-x-1.5">
            {["dana", "marcus", "sam", "merge-agent-01"].map((id) => (
              <ActorAvatar key={id} id={id} size="sm" className="ring-2 ring-card" />
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}

function DiffRow({ sign, children, className }: { sign: "+" | "-" | "~" | " "; children: React.ReactNode; className?: string }) {
  const tone = sign === "+" ? "bg-verified-soft/70" : sign === "-" ? "bg-abort-soft/60" : sign === "~" ? "bg-flagged-soft/60" : ""
  return (
    <div className={cn("grid grid-cols-[28px_1fr] font-mono text-xs leading-6", tone, className)}>
      <span className="select-none text-center text-muted-foreground">{sign === " " ? "" : sign}</span>
      <span className="pr-3">{children}</span>
    </div>
  )
}

function Changes() {
  const p = PATEL_COLLAPSE
  const o = OKAFOR_HOLD
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5 text-sm">
          <Minus className="h-3.5 w-3.5 text-abort" />
          <Plus className="h-3.5 w-3.5 text-verified" />
          <span className="font-mono text-xs">households/{p.id}</span>
          <span className="text-muted-foreground">· {p.household}</span>
          <Badge variant="verified" className="ml-auto">4 records → 1 household</Badge>
        </div>
        <div className="grid divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          <div className="py-2">
            <div className="px-4 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Before · 4 source records</div>
            {p.records.map((r, i) => (
              <div key={i} className="mt-1">
                <DiffRow sign="-">
                  <span className="inline-flex items-center gap-1.5">
                    <SourceIcon type={r.type} size={10} /> {r.label}
                  </span>
                </DiffRow>
                {Object.entries(r.fields).map(([k, v]) => (
                  <DiffRow key={k} sign="-" className="text-muted-foreground">
                    &nbsp;&nbsp;{k}: <span className="text-foreground">{v}</span>
                  </DiffRow>
                ))}
              </div>
            ))}
          </div>
          <div className="py-2">
            <div className="px-4 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">After · 1 unified record</div>
            <div className="mt-1">
              <DiffRow sign="+">
                <span className="font-medium">{p.result.id} · {p.result.name}</span>
              </DiffRow>
              {Object.entries(p.result)
                .filter(([k]) => k !== "id" && k !== "name")
                .map(([k, v]) => (
                  <DiffRow key={k} sign="+" className="text-muted-foreground">
                    &nbsp;&nbsp;{k}: <span className="text-foreground">{v}</span>
                  </DiffRow>
                ))}
              <DiffRow sign=" " className="mt-2 text-muted-foreground">
                &nbsp;&nbsp;# every field links back to the record it came from
              </DiffRow>
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border-flagged/40">
        <div className="flex items-center gap-2 border-b bg-flagged-soft/60 px-4 py-2.5 text-sm">
          <AlertTriangle className="h-3.5 w-3.5 text-flagged" />
          <span className="font-mono text-xs">households/{o.id}</span>
          <span className="text-muted-foreground">· {o.household}</span>
          <Badge variant="flagged" className="ml-auto">Held · routed to Dana Ruiz</Badge>
        </div>
        <div className="grid divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
          {[o.a, o.b].map((v) => (
            <div key={v.source} className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <SourceIcon type={v.type} size={11} /> <span className="font-medium text-foreground">{v.source}</span> · {v.date}
              </div>
              <div className="mt-2 font-display text-[28px] font-medium leading-none tracking-[-0.03em] tabular">{v.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{o.field}</div>
            </div>
          ))}
        </div>
        <div className="border-t bg-muted/40 px-4 py-3 text-sm">
          <DiffRow sign="~">
            {o.field}: <span className="line-through opacity-60">{o.a.value}</span> | <span className="line-through opacity-60">{o.b.value}</span> → <span className="font-medium">held</span> (Δ {o.delta})
          </DiffRow>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <ActorAvatar id="dana" size="xs" /> {o.note}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between border-b px-4 py-2.5 text-sm">
          <span className="font-medium">39 more held records</span>
          <span className="text-xs text-muted-foreground">All routed to Dana Ruiz · none changed</span>
        </div>
        <div className="max-h-72 overflow-y-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Household</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Disagreeing sources</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {OTHER_HELD.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">{h.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{h.id}</TableCell>
                  <TableCell>{h.field}</TableCell>
                  <TableCell className="text-muted-foreground">{h.sources}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

function Checks() {
  return (
    <Card>
      <ul className="divide-y">
        {MR.checks.map((c) => (
          <li key={c.id} className="flex items-center gap-3 px-4 py-3">
            {c.status === "pass" ? <CheckCircle2 className="h-5 w-5 shrink-0 text-verified" /> : <AlertTriangle className="h-5 w-5 shrink-0 text-flagged" />}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{c.label}</div>
              <div className="text-xs text-muted-foreground">{c.detail}</div>
            </div>
            <Badge variant={c.status === "pass" ? "verified" : "flagged"}>{c.status === "pass" ? "Passed" : "Warning"}</Badge>
            <span className="w-14 text-right font-mono text-xs text-muted-foreground tabular">{c.status === "pass" ? "1.2s" : "0.4s"}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 border-t bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" /> Checks ran at {absoluteTime(MR_TIMELINE[2].at)} on merge-agent-01. A warning does not block a human approval.
      </div>
    </Card>
  )
}
