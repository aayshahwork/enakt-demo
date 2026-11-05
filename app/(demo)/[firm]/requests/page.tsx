"use client"

import Link from "next/link"
import { ArrowUpRight, Inbox } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ActorAvatar, ActorName } from "@/components/demo/actor"
import { Card, PageHeader } from "@/components/demo/page"
import { RequestStatusPill } from "@/components/demo/verdict-pill"
import { AGENTS, REQUESTS, href } from "@/lib/demo/fixtures"
import { relativeTime } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

export default function RequestsPage() {
  const requestDone = useDemo((s) => s.requestPhase === "done")
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <PageHeader
        title="Requests"
        description="Every agent starts from a request. Enakt scopes it from metadata, asks the two or three people who own the data, and opens a connection request."
        actions={
          <Button size="sm" variant="signal" onClick={() => toast("New request", { description: "In the demo, requests come from the fixtures. R-3 is the one to play." })}>
            <Inbox /> New request
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <ul className="divide-y">
          {REQUESTS.map((r) => {
            const status = r.id === "r-3" && requestDone ? "scoped" : r.status
            const to = r.id === "r-3" ? href("/requests/r-3") : r.agentId ? href(`/agents/${r.agentId}`) : href("/audit")
            return (
              <li key={r.id}>
                <Link href={to} className={cn("flex items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/60", r.id === "r-3" && "bg-signal-soft/30")}>
                  <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground">{r.label}</span>
                  <ActorAvatar id={r.requesterId} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{r.title}</span>
                      {r.agentId && <span className="hidden truncate rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground md:inline">{AGENTS[r.agentId].name}</span>}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      <ActorName id={r.requesterId} className="text-xs" /> · {relativeTime(r.submittedAt)} · &ldquo;{r.text}&rdquo;
                    </div>
                  </div>
                  <RequestStatusPill status={status} />
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="border-t bg-muted/40 px-4 py-2 text-xs text-muted-foreground">5 requests · 2 done · 1 scoping · 1 queued · 1 blocked on a red source</div>
      </Card>
    </div>
  )
}
