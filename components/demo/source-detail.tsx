"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { AlertTriangle, ArrowLeft, BellRing, Clock, ExternalLink, Map as MapIcon, MessageSquare, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, PageHeader, Stat } from "@/components/demo/page"
import { ActorAvatar, ActorName, getActor } from "@/components/demo/actor"
import { SourceIcon } from "@/components/demo/source-icon"
import { VerdictPill, VERDICT_COLOR } from "@/components/demo/verdict-pill"
import { FreshnessSparkline } from "@/components/demo/sparkline"
import { AFFECTED_HOUSEHOLDS, PATEL_CONFLICT, SOURCE_BY_SLUG, SOURCE_TYPE_LABEL, VERDICT_LABEL } from "@/lib/demo/fixtures"
import { absoluteTime, fmtInt, fmtUSD, relativeTime } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

export function SourceDetail({ slug }: { slug: string }) {
  const s = SOURCE_BY_SLUG[slug]
  const { activity } = useDemo()
  const related = activity.filter((e) => e.href === `/northfield/sources/${slug}`)
  const isConflict = slug === "salesforce-crm" || slug === "aum-rollup"

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <Link href="/northfield/sources" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> All sources
      </Link>
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-2">
            <SourceIcon type={s.type} size={12} /> {SOURCE_TYPE_LABEL[s.type]} · <span className="font-mono">{s.location}</span>
          </span>
        }
        title={
          <span className="flex items-center gap-3">
            {s.name} <VerdictPill verdict={s.verdict} className="translate-y-px" />
          </span>
        }
        description={s.reason}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/northfield/map">
                <MapIcon /> View on map
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast("Opening in a new tab (demo)", { description: s.location })}>
              <ExternalLink /> Open source
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Records" value={fmtInt(s.records)} hint={s.recordNoun} />
        <Stat label="Owner" value={<span className="flex items-center gap-2 text-lg"><ActorAvatar id={s.ownerId} size="sm" />{getActor(s.ownerId).name}</span>} hint={s.ownerConfirmed ? "confirmed" : "unconfirmed"} />
        <Stat label="Cadence" value={<span className="text-lg">{s.cadence}</span>} hint={`last ${relativeTime(s.lastEdit)}`} />
        <Card className="px-4 py-3.5">
          <div className="text-xs font-medium text-muted-foreground">Freshness · 12 weeks</div>
          <div className="mt-2 flex items-center gap-3">
            <FreshnessSparkline data={s.freshness} color={VERDICT_COLOR[s.verdict]} />
            <span className="text-xs text-muted-foreground">{s.freshness.filter(Boolean).length} of 12 weeks</span>
          </div>
        </Card>
      </div>

      {isConflict && <ConflictPanel side={slug === "salesforce-crm" ? "a" : "b"} />}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader title="Details" />
          <dl className="divide-y text-sm">
            {[
              ["Owner", <span key="o" className="flex items-center gap-2"><ActorAvatar id={s.ownerId} size="xs" /><ActorName id={s.ownerId} withRole /></span>],
              ["Last edit", `${absoluteTime(s.lastEdit)} · ${s.lastEditBy === s.ownerId ? "by owner" : `by ${s.lastEditBy}`}`],
              ["Feeds", s.feeds.length ? s.feeds.join(", ") : "Nothing downstream"],
              ["Verdict", VERDICT_LABEL[s.verdict]],
              ["Read access", s.verdict === "restricted" ? "None requested" : "Metadata only"],
            ].map(([k, v]) => (
              <div key={k as string} className="grid grid-cols-[110px_1fr] gap-3 px-4 py-2.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="min-w-0">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader title="Activity on this source" />
          {related.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No activity recorded yet. Enakt logs the first event when an owner confirms.</div>
          ) : (
            <ul className="divide-y">
              {related.map((e) => (
                <li key={e.id} className="flex items-start gap-3 px-4 py-2.5 text-sm">
                  <ActorAvatar id={e.actorId} size="sm" />
                  <div className="flex-1">
                    <ActorName id={e.actorId} /> <span className="text-muted-foreground">{e.text}</span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular">{relativeTime(e.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

function ConflictPanel({ side }: { side: "a" | "b" }) {
  const c = PATEL_CONFLICT
  const [snoozed, setSnoozed] = React.useState(false)
  const [asked, setAsked] = React.useState(false)
  const [showAll, setShowAll] = React.useState(false)
  const list = showAll ? AFFECTED_HOUSEHOLDS : AFFECTED_HOUSEHOLDS.slice(0, 8)

  const askOwner = () => {
    setAsked(true)
    toast("Asked Priya Nair to confirm row 214", { description: "Sent to priya@northfieldwp.com with both values and their sources. No value was changed." })
  }
  const snooze = () => {
    setSnoozed(true)
    toast("Snoozed until the Oct 31 rollup", { description: "Enakt will re-compare both values when AUM_Rollup.xlsx is next saved." })
  }

  return (
    <Card className="overflow-hidden border-abort/30">
      <div className="flex items-center justify-between gap-4 border-b bg-abort-soft/60 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="h-4 w-4 text-abort" />
          Conflict · {c.household} · {c.field}
          <Badge variant="outline" className="font-mono">{c.householdId}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={askOwner} disabled={asked}>
            <MessageSquare /> {asked ? "Owner asked" : "Ask owner"}
          </Button>
          <Button size="sm" variant="outline" onClick={snooze} disabled={snoozed}>
            {snoozed ? <BellRing /> : <Clock />} {snoozed ? "Snoozed" : "Snooze until rollup"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
        {(["a", "b"] as const).map((k) => {
          const v = c[k]
          const src = SOURCE_BY_SLUG[v.sourceSlug]
          const here = k === side
          return (
            <div key={k} className={cn("p-5", here && "bg-muted/30")}>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <SourceIcon type={src.type} size={12} />
                <Link href={`/northfield/sources/${v.sourceSlug}`} className="font-medium text-foreground hover:text-signal">{v.source}</Link>
                {here && <Badge variant="outline">this source</Badge>}
              </div>
              <div className="mt-3 font-display text-[34px] font-medium leading-none tracking-[-0.03em] tabular">{v.display}</div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-16 shrink-0">Where</span>
                  <span className="font-mono text-xs text-foreground">{v.where}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-16 shrink-0">Updated</span>
                  <span className="text-foreground">{v.date}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-16 shrink-0">By</span>
                  <span className="flex items-center gap-1.5 text-foreground">
                    <ActorAvatar id={v.by} size="xs" /> {getActor(v.by).name}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-start gap-3 border-t bg-muted/40 px-5 py-4">
        <Scale className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <div className="text-sm font-medium">{c.verdict}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">Difference of {c.delta}. Salesforce is newer; the rollup is what the quarterly reports read. Neither is proof of the other.</div>
        </div>
      </div>

      <div className="border-t">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-medium">
            Affected households: <span className="font-mono tabular">{c.affectedCount}</span>
          </div>
          <button onClick={() => setShowAll((v) => !v)} className="text-xs text-muted-foreground hover:text-foreground">
            {showAll ? "Show fewer" : `Show all ${c.affectedCount}`}
          </button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Household</TableHead>
              <TableHead>ID</TableHead>
              <TableHead className="text-right">Salesforce</TableHead>
              <TableHead className="text-right">AUM_Rollup</TableHead>
              <TableHead className="text-right">Row</TableHead>
              <TableHead className="text-right">Δ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((h) => {
              const d = h.salesforce - h.rollup
              return (
                <TableRow key={h.id} className={cn(h.id === "CL-00318" && "bg-abort-soft/40")}>
                  <TableCell className="font-medium">{h.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{h.id}</TableCell>
                  <TableCell className="text-right font-mono text-xs tabular">{fmtUSD(h.salesforce)}</TableCell>
                  <TableCell className="text-right font-mono text-xs tabular">{fmtUSD(h.rollup)}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground tabular">{h.row}</TableCell>
                  <TableCell className={cn("text-right font-mono text-xs tabular", d > 0 ? "text-verified" : "text-abort")}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{d > 0 ? "+" : "−"}{fmtUSD(Math.abs(d))}</span>
                      </TooltipTrigger>
                      <TooltipContent>Salesforce minus rollup</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
