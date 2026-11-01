"use client"

import * as React from "react"
import Link from "next/link"
import { Search, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ActorAvatar, ActorName, getActor } from "@/components/demo/actor"
import { Card, EmptyState, PageHeader } from "@/components/demo/page"
import { AUDIT } from "@/lib/demo/fixtures"
import { absoluteTime, fmtInt, relativeTime } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

type Filter = "all" | "people" | "agents" | "blocked"
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "people", label: "People" },
  { id: "agents", label: "Agents" },
  { id: "blocked", label: "Blocked" },
]

export default function AuditPage() {
  const extraAudit = useDemo((s) => s.extraAudit)
  const [filter, setFilter] = React.useState<Filter>("all")
  const [q, setQ] = React.useState("")

  const all = React.useMemo(() => [...extraAudit, ...AUDIT].sort((a, b) => b.at.getTime() - a.at.getTime()), [extraAudit])
  const rows = React.useMemo(() => {
    const needle = q.trim().toLowerCase()
    return all.filter((a) => {
      const actor = getActor(a.actorId)
      if (filter === "people" && actor.kind === "agent") return false
      if (filter === "agents" && actor.kind !== "agent") return false
      if (filter === "blocked" && a.kind !== "blocked") return false
      if (!needle) return true
      return `${a.id} ${actor.name} ${a.text} ${a.path ?? ""}`.toLowerCase().includes(needle)
    })
  }, [all, filter, q])

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <PageHeader title="Audit log" description="Every read, merge, policy change and block, by people and agents. Kept inside the network." />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-md border bg-card p-0.5 shadow-sm">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={cn("h-7 rounded px-2.5 text-xs font-medium transition-colors", filter === f.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground")}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-72">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events, actors, paths…" className="h-8 pl-8 text-xs" aria-label="Search audit log" />
        </div>
      </div>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={ShieldCheck} title="No matching entries" description="Try a different filter or search term. Nothing is hidden from this log." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[170px]">Time</TableHead>
                <TableHead className="w-[270px]">Actor</TableHead>
                <TableHead>Event</TableHead>
                <TableHead className="w-[280px]">Path</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id} className={cn(a.kind === "blocked" && "bg-abort-soft/30")}>
                  <TableCell className="align-top">
                    <div className="text-xs tabular">{absoluteTime(a.at)}</div>
                    <div className="text-[11px] text-muted-foreground tabular">{relativeTime(a.at)}</div>
                  </TableCell>
                  <TableCell className="align-top">
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <ActorAvatar id={a.actorId} size="sm" />
                      <ActorName id={a.actorId} />
                    </span>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex items-start gap-2">
                      {a.kind === "blocked" && <Badge variant="abort">Blocked</Badge>}
                      {a.kind === "merge" && <Badge variant="merged">Merge</Badge>}
                      {a.kind === "policy" && <Badge variant="signal">Policy</Badge>}
                      <span className={cn("text-sm leading-5", a.kind === "blocked" && "text-abort")}>{a.text}</span>
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{a.id}</div>
                  </TableCell>
                  <TableCell className="align-top">
                    {a.path ? (
                      <span className="break-all font-mono text-[11px] text-muted-foreground">{a.path}</span>
                    ) : a.href ? (
                      <Link href={a.href} className="text-xs text-signal underline-offset-4 hover:underline">
                        Open
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="flex items-center gap-2 border-t bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Showing {fmtInt(rows.length)} of {fmtInt(all.length)} entries · retained 7 years · exported nightly to the Ashcombe archive share
        </div>
      </Card>
    </div>
  )
}
