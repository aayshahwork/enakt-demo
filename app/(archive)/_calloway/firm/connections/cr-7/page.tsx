"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, ArrowLeft, Check, CheckCircle2, Cloud, GitMerge, GitPullRequest, Loader2, Lock, MessageSquare, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, UnderlineTabsList, UnderlineTabsTrigger } from "@/components/ui/tabs"
import { ActorAvatar, ActorName, ModelBadge, getActor } from "@/components/demo/actor"
import { Card } from "@/components/demo/page"
import { SourceIcon } from "@/components/demo/source-icon"
import { AGENT_POLICY, CR, MODEL, NOW, REVENUE, SOURCE_BY_ID, href } from "@/lib/demo/fixtures"
import { absoluteTime, relativeTime } from "@/lib/demo/format"
import { useDemo, type ConnectStatus } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

const MERGED_AT = new Date(NOW.getTime() + 3 * 60_000)

export default function ConnectionRequestPage() {
  const crStatus = useDemo((s) => s.crStatus)
  const crPct = useDemo((s) => s.crPct)
  const approvals = useDemo((s) => s.approvals)
  const approveAs = useDemo((s) => s.approveAs)
  const merged = crStatus === "merged"

  const timeline = [
    ...CR.timeline,
    ...approvals.map((id, i) => ({ id: `ap-${id}`, at: new Date(NOW.getTime() + (i + 1) * 60_000), actor: id, text: `approved as ${CR.approvers.find((a) => a.id === id)?.role.toLowerCase()}` })),
    ...(merged ? [{ id: "t-merged", at: MERGED_AT, actor: "grace", text: "merged this request · enforced at Datasite, SharePoint and DealCloud" }] : []),
  ]

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 p-6">
      <Link href={href("/connections")} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Connections
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-[22px] font-medium leading-7 tracking-[-0.02em]">
            <span className="text-muted-foreground">CR-{CR.number}</span> · {CR.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <AnimatePresence mode="wait" initial={false}>
              {merged ? (
                <motion.span key="merged" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}>
                  <Badge variant="verified" className="h-6 gap-1 px-2.5 text-xs">
                    <GitMerge className="h-3.5 w-3.5" /> Merged
                  </Badge>
                </motion.span>
              ) : (
                <motion.span key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Badge variant="signal" className="h-6 gap-1 px-2.5 text-xs">
                    <GitPullRequest className="h-3.5 w-3.5" /> Open
                  </Badge>
                </motion.span>
              )}
            </AnimatePresence>
            <span className="inline-flex items-center gap-1.5">
              opened by <ActorAvatar id={CR.openedBy} size="xs" /> <ActorName id={CR.openedBy} withModel={false} className="text-foreground" /> {relativeTime(CR.openedAt)}
            </span>
            <span>·</span>
            <span>from request R-3</span>
            <span>·</span>
            <span className="tabular">
              approvals <span className={cn("font-medium", merged ? "text-verified" : "text-foreground")}>{approvals.length} of {CR.approvers.length}</span>
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!merged && (
            <Button variant="outline" size="sm" onClick={() => toast("Comment posted", { description: "connect-agent will reply in the Conversation tab." })}>
              <MessageSquare /> Comment
            </Button>
          )}
          <ApproveButtons status={crStatus} pct={crPct} approvals={approvals} onApprove={(id) => void approveAs(id)} />
        </div>
      </div>

      <div className="grid grid-cols-4 overflow-hidden rounded-xl border bg-card shadow-sm">
        {[
          { label: "Sources", value: String(CR.stats.sources), hint: "Atlas data room, model v7, deal record, template", color: "" },
          { label: "Queries replayed", value: CR.stats.replayed.toLocaleString("en-US"), hint: "dry run against the proposed scope", color: "text-signal" },
          { label: "Reads outside Atlas", value: String(CR.stats.outside), hint: "denied at the source, logged", color: "text-verified" },
          { label: "Held for a person", value: String(CR.stats.held), hint: `TTM revenue · ${REVENUE.id}`, color: "text-flagged" },
        ].map((s, i) => (
          <div key={s.label} className={cn("px-4 py-3", i > 0 && "border-l")}>
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className={cn("mt-0.5 font-display text-2xl font-medium tracking-[-0.03em] tabular", s.color)}>{s.value}</div>
            <div className="truncate text-[11px] text-muted-foreground">{s.hint}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="conversation">
        <UnderlineTabsList>
          <UnderlineTabsTrigger value="conversation">
            Conversation <span className="rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground tabular">{timeline.length + 1}</span>
          </UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="changes">
            Changes <span className="rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground tabular">{CR.diff.length}</span>
          </UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="checks">
            Checks
            <span className="inline-flex items-center gap-0.5 text-[11px]">
              <CheckCircle2 className="h-3 w-3 text-verified" /> 3 <AlertTriangle className="ml-1 h-3 w-3 text-flagged" /> 1
            </span>
          </UnderlineTabsTrigger>
        </UnderlineTabsList>

        <TabsContent value="conversation">
          <Conversation timeline={timeline} merged={merged} approvals={approvals} />
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

function ApproveButtons({ status, pct, approvals, onApprove }: { status: ConnectStatus; pct: number; approvals: string[]; onApprove: (id: string) => void }) {
  if (status === "merged") {
    return (
      <Button variant="verified" size="sm" disabled className="disabled:opacity-100">
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
    <>
      {CR.approvers.map((a) => {
        const done = approvals.includes(a.id)
        return (
          <Button key={a.id} variant={done ? "outline" : "verified"} size="sm" disabled={done} onClick={() => onApprove(a.id)} id={`approve-${a.id}`} className={cn(done && "disabled:opacity-100")}>
            {done ? <Check /> : <ShieldCheck />} {done ? `${getActor(a.id).name.split(" ")[0]} approved` : `Approve as ${getActor(a.id).name}`}
          </Button>
        )
      })}
    </>
  )
}

function Conversation({ timeline, merged, approvals }: { timeline: { id: string; at: Date; actor: string; text: string }[]; merged: boolean; approvals: string[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-4">
        <Card>
          <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5 text-sm">
            <ActorAvatar id={CR.openedBy} size="sm" />
            <ActorName id={CR.openedBy} />
            <span className="text-muted-foreground">opened {relativeTime(CR.openedAt)}</span>
            <Badge variant="outline" className="ml-auto gap-1">
              Agent summary
            </Badge>
          </div>
          <div className="space-y-3 px-4 py-4 text-sm leading-6">
            <p>{CR.summary}</p>
            <div className="rounded-md border bg-muted/40 p-3 text-xs">
              <div className="mb-1.5 font-medium">Sources in this request</div>
              <ul className="space-y-1">
                {CR.sources.map((id) => {
                  const s = SOURCE_BY_ID[id]
                  return (
                    <li key={id} className="flex items-center gap-2">
                      <SourceIcon type={s.type} size={11} />
                      <Link href={href(`/map?source=${id}`)} className="font-medium hover:text-signal">
                        {s.name}
                      </Link>
                      <span className="truncate text-muted-foreground">· {s.enforcement}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
            <p className="text-muted-foreground">{CR.notRead}</p>
          </div>
        </Card>

        <ol className="relative ml-4 space-y-4 border-l pl-6">
          {timeline.map((t) => (
            <li key={t.id} className="relative text-sm">
              <span className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border bg-card">
                {t.text.startsWith("merged") ? (
                  <GitMerge className="h-3 w-3 text-verified" />
                ) : t.text.startsWith("approved") ? (
                  <Check className="h-3 w-3 text-verified" />
                ) : t.text.includes("checks") || t.text.includes("dry run") ? (
                  <ShieldCheck className="h-3 w-3 text-signal" />
                ) : t.text.includes("blocked") ? (
                  <Lock className="h-3 w-3 text-abort" />
                ) : (
                  <GitPullRequest className="h-3 w-3 text-muted-foreground" />
                )}
              </span>
              <ActorName id={t.actor} /> <span className="text-muted-foreground">{t.text}</span>
              <span className="ml-2 text-xs text-muted-foreground tabular">{absoluteTime(t.at)}</span>
            </li>
          ))}
        </ol>

        {merged && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="flex items-center gap-3 rounded-xl border border-verified/40 bg-verified-soft px-4 py-3 text-sm">
            <GitMerge className="h-4 w-4 text-verified" />
            <span>
              <span className="font-mono text-xs">atlas-memo-agent</span> is live on Project Atlas with read access to 4 sources. The held revenue value stays with Nina Alvarez.{" "}
              <Link href={href("/agents/atlas-memo-agent")} className="font-medium text-verified underline-offset-4 hover:underline">
                Run it
              </Link>
              .
            </span>
          </motion.div>
        )}
      </div>

      <aside className="space-y-4 text-sm">
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">Required approvers</div>
          <ul className="space-y-1.5">
            {CR.approvers.map((a) => {
              const done = approvals.includes(a.id)
              return (
                <li key={a.id} className="flex items-center gap-2">
                  <ActorAvatar id={a.id} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium leading-5">{getActor(a.id).name}</span>
                    <span className="block text-xs text-muted-foreground">{a.role}</span>
                  </span>
                  {done ? <Check className="h-4 w-4 text-verified" /> : <span className="text-[11px] text-muted-foreground">pending</span>}
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">Author</div>
          <div className="flex items-center gap-2">
            <ActorAvatar id={CR.openedBy} size="sm" /> <ActorName id={CR.openedBy} withModel={false} /> <ModelBadge />
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">Model</div>
          <div className="flex items-center gap-1.5 text-xs">
            <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{MODEL.name}</span>
            <span className="text-muted-foreground">· {MODEL.tenant}</span>
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">Enforcement on merge</div>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {AGENT_POLICY["atlas-memo-agent"].enforcement.map((e) => (
              <li key={e} className="flex items-start gap-1.5">
                <Lock className="mt-0.5 h-3 w-3 shrink-0" /> {e}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">Participants</div>
          <div className="flex -space-x-1.5">
            {["ellen", "grace", "dana", "connect-agent", "atlas-memo-agent"].map((id) => (
              <ActorAvatar key={id} id={id} size="sm" className="ring-2 ring-card" />
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}

function Changes() {
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5 text-sm">
          <span className="font-mono text-xs">policies/atlas-memo-agent.yaml</span>
          <span className="text-muted-foreground">· new file</span>
          <Badge variant="verified" className="ml-auto">
            +{CR.diff.length} lines
          </Badge>
        </div>
        <div className="py-2">
          {CR.diff.map((line) => (
            <div key={line} className="grid grid-cols-[28px_1fr] bg-verified-soft/70 font-mono text-xs leading-6">
              <span className="select-none text-center text-verified">+</span>
              <span className="whitespace-pre pr-3">{line.slice(2)}</span>
            </div>
          ))}
          <div className="mt-2 grid grid-cols-[28px_1fr] font-mono text-xs leading-6 text-muted-foreground">
            <span />
            <span className="pr-3"># enforced at Datasite group, SharePoint permission, DealCloud row filter, model gateway</span>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between border-b px-4 py-2.5 text-sm">
          <span className="font-medium">What does not change</span>
          <span className="text-xs text-muted-foreground">nothing outside Project Atlas</span>
        </div>
        <ul className="divide-y text-sm">
          {[
            ["Birch data room, Birch_Model.xlsx", "stay with the Birch team under their NDA"],
            ["LP database, fee & carry", "stay red; no agent reads them"],
            ["Atlas_Model_v6.xlsx", "not in scope until the memo draft link is retired"],
            ["Writes", "none; drafts return to the deal team for review"],
          ].map(([k, v]) => (
            <li key={k} className="grid grid-cols-[260px_1fr] gap-3 px-4 py-2">
              <span className="font-medium">{k}</span>
              <span className="text-muted-foreground">{v}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

function Checks() {
  return (
    <Card>
      <ul className="divide-y">
        {CR.checks.map((c) => (
          <li key={c.id} className="flex items-center gap-3 px-4 py-3">
            {c.status === "pass" ? <CheckCircle2 className="h-5 w-5 shrink-0 text-verified" /> : <AlertTriangle className="h-5 w-5 shrink-0 text-flagged" />}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{c.label}</div>
              <div className="text-xs text-muted-foreground">{c.detail}</div>
            </div>
            <Badge variant={c.status === "pass" ? "verified" : "flagged"}>{c.status === "pass" ? "Passed" : "Held"}</Badge>
            <span className="w-14 text-right font-mono text-xs text-muted-foreground tabular">{c.ms}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 border-t bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" /> Checks ran at {absoluteTime(CR.timeline[4].at)} in the {MODEL.tenant}. A held value does not block approval; it stays out of the agent&apos;s facts. Agents cannot approve.
      </div>
    </Card>
  )
}
