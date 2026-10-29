"use client"

import Link from "next/link"
import { GitMerge, GitPullRequest, GitPullRequestClosed } from "lucide-react"
import { Card, PageHeader } from "@/components/demo/page"
import { ActorAvatar, ActorName } from "@/components/demo/actor"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MR_LIST } from "@/lib/demo/fixtures"
import { relativeTime } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

export default function MergeRequestsPage() {
  const { state } = useDemo()
  const list = MR_LIST.map((m) => (m.number === 12 && state.mergeStatus === "merged" ? { ...m, status: "merged" as const } : m))
  const open = list.filter((m) => m.status === "open").length

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-6">
      <PageHeader title="Merge requests" description="Every change to the Unified Client Record arrives as a merge request with a human reviewer." />
      <Card>
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">{open} open</TabsTrigger>
              <TabsTrigger value="merged">{list.filter((m) => m.status === "merged").length} merged</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <ul className="divide-y">
          {list.map((m) => {
            const Icon = m.status === "open" ? GitPullRequest : m.status === "merged" ? GitMerge : GitPullRequestClosed
            const color = m.status === "open" ? "text-verified" : m.status === "merged" ? "text-merged" : "text-muted-foreground"
            const href = m.number === 12 ? "/northfield/merge-requests/12" : "/northfield/merge-requests"
            return (
              <li key={m.number}>
                <Link href={href} className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/60">
                  <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", color)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{m.title}</span>
                      {m.number === 12 && m.status === "open" && <Badge variant="flagged">Review requested</Badge>}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="font-mono">MR-{m.number}</span> · opened {relativeTime(m.opened)} by <ActorName id={m.author} className="text-foreground" /> · reviewer <ActorName id={m.reviewer} withModel={false} className="text-foreground" />
                    </div>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground tabular">{m.changes}</span>
                  <ActorAvatar id={m.reviewer} size="sm" />
                </Link>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
