"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react"
import { Card, PageHeader } from "@/components/demo/page"
import { ActorAvatar, getActor } from "@/components/demo/actor"
import { SourceIcon } from "@/components/demo/source-icon"
import { VerdictPill } from "@/components/demo/verdict-pill"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SOURCES, SOURCE_TYPE_LABEL, type Source } from "@/lib/demo/fixtures"
import { absoluteTime, fmtInt, relativeTime } from "@/lib/demo/format"
import { cn } from "@/lib/utils"

type Key = "name" | "type" | "verdict" | "owner" | "records" | "lastEdit"
const VERDICT_RANK = { conflict: 0, stale: 1, unverified: 2, restricted: 3, ready: 4 }

function val(s: Source, k: Key): string | number {
  switch (k) {
    case "name": return s.name.toLowerCase()
    case "type": return SOURCE_TYPE_LABEL[s.type]
    case "verdict": return VERDICT_RANK[s.verdict]
    case "owner": return getActor(s.ownerId).name
    case "records": return s.records
    case "lastEdit": return s.lastEdit.getTime()
  }
}

export default function SourcesPage() {
  const [sort, setSort] = React.useState<{ key: Key; dir: 1 | -1 }>({ key: "verdict", dir: 1 })
  const [q, setQ] = React.useState("")
  const rows = React.useMemo(() => {
    const filtered = SOURCES.filter((s) => !q || s.name.toLowerCase().includes(q.toLowerCase()) || SOURCE_TYPE_LABEL[s.type].toLowerCase().includes(q.toLowerCase()))
    return [...filtered].sort((a, b) => {
      const x = val(a, sort.key), y = val(b, sort.key)
      return (x < y ? -1 : x > y ? 1 : 0) * sort.dir
    })
  }, [sort, q])

  const Head = ({ k, children, className }: { k: Key; children: React.ReactNode; className?: string }) => {
    const active = sort.key === k
    return (
      <TableHead className={className}>
        <button
          onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? ((s.dir * -1) as 1 | -1) : 1 }))}
          className={cn("inline-flex items-center gap-1 rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active && "text-foreground")}
        >
          {children}
          {active ? sort.dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3 opacity-40" />}
        </button>
      </TableHead>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 p-6">
      <PageHeader
        title="Sources"
        description="Every database, tracker, and file the firm runs on, with a verdict on whether it is safe to merge."
        actions={
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter sources" className="w-56 pl-8" />
          </div>
        }
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <Head k="name" className="w-[280px]">Source</Head>
              <Head k="verdict">Verdict</Head>
              <Head k="owner">Owner</Head>
              <Head k="records" className="text-right">Records</Head>
              <TableHead>Cadence</TableHead>
              <Head k="lastEdit">Last edit</Head>
              <TableHead>Feeds</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No sources match &ldquo;{q}&rdquo;.
                </TableCell>
              </TableRow>
            )}
            {rows.map((s) => (
              <TableRow key={s.slug} className="group">
                <TableCell>
                  <Link href={`/northfield/sources/${s.slug}`} className="flex items-center gap-2.5 font-medium hover:text-signal">
                    <SourceIcon type={s.type} size={14} />
                    <span className="truncate">{s.name}</span>
                    <span className="whitespace-nowrap text-xs font-normal text-muted-foreground">{SOURCE_TYPE_LABEL[s.type]}</span>
                  </Link>
                </TableCell>
                <TableCell>
                  <VerdictPill verdict={s.verdict} />
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-2">
                    <ActorAvatar id={s.ownerId} size="xs" />
                    <span className={cn(!s.ownerConfirmed && "text-muted-foreground")}>{getActor(s.ownerId).name}{!s.ownerConfirmed && "?"}</span>
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-xs tabular">{fmtInt(s.records)}</TableCell>
                <TableCell className="text-muted-foreground">{s.cadence}</TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-muted-foreground tabular">{relativeTime(s.lastEdit)}</span>
                    </TooltipTrigger>
                    <TooltipContent>{absoluteTime(s.lastEdit)}</TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">{s.feeds.join(", ") || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
