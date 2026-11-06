"use client"

import Link from "next/link"
import { ArrowUpRight, GitMerge, GitPullRequest } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ActorAvatar, ActorName } from "@/components/demo/actor"
import { Card, PageHeader } from "@/components/demo/page"
import { CONNECTIONS_LIST } from "@/lib/demo/fixtures"
import { relativeTime } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

export default function ConnectionsPage() {
  const crStatus = useDemo((s) => s.crStatus)
  const approvals = useDemo((s) => s.approvals)
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <PageHeader title="Connections" description="A connection request grants one agent read access to specific sources. connect-agent opens them; the deal partner and the CCO approve; enforcement happens at each system." />
      <Card className="overflow-hidden">
        <ul className="divide-y">
          {CONNECTIONS_LIST.map((c) => {
            const merged = c.id === "cr-7" ? crStatus === "merged" : c.status === "merged"
            const approvalText = c.id === "cr-7" && !merged ? `${approvals.length} of 2` : "2 of 2"
            return (
              <li key={c.id}>
                <Link href={c.href} className={cn("flex items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/60", c.id === "cr-7" && !merged && "bg-signal-soft/30")}>
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", merged ? "bg-verified-soft text-verified" : "bg-signal-soft text-signal")}>
                    {merged ? <GitMerge className="h-4 w-4" /> : <GitPullRequest className="h-4 w-4" />}
                  </span>
                  <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">{c.label}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{c.title}</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      opened by <ActorAvatar id={c.openedBy} size="xs" /> <ActorName id={c.openedBy} withModel={false} className="text-xs" /> · {relativeTime(c.openedAt)}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground tabular">approvals {approvalText}</span>
                  <Badge variant={merged ? "verified" : "signal"}>{merged ? "Merged" : "Open"}</Badge>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="border-t bg-muted/40 px-4 py-2 text-xs text-muted-foreground">Every merge is enforced at the source: Datasite groups, SharePoint permissions, DealCloud row filters. Agents cannot approve.</div>
      </Card>
    </div>
  )
}
