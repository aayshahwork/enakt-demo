"use client"

import * as React from "react"
import Link from "next/link"
import { Card, PageHeader } from "@/components/demo/page"
import { ActorAvatar, ActorName } from "@/components/demo/actor"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { absoluteTime, relativeTime, shortDate } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { getActor } from "@/components/demo/actor"

type Filter = "all" | "agents" | "people"

export default function ActivityPage() {
  const { activity } = useDemo()
  const [filter, setFilter] = React.useState<Filter>("all")
  const list = activity.filter((e) => (filter === "all" ? true : filter === "agents" ? getActor(e.actorId).kind === "agent" : getActor(e.actorId).kind === "person"))

  const groups = list.reduce<Record<string, typeof list>>((acc, e) => {
    const k = shortDate(e.at)
    ;(acc[k] ||= []).push(e)
    return acc
  }, {})

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <PageHeader
        title="Activity"
        description="Every agent and human action in the workspace, in order. Agent writes always point at a merge request."
        actions={
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />
      <Card>
        {Object.entries(groups).map(([day, entries]) => (
          <div key={day}>
            <div className="sticky top-0 border-b bg-muted/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">{day}</div>
            <ul className="divide-y">
              {entries.map((e) => (
                <li key={e.id} className="flex items-start gap-3 px-4 py-3">
                  <ActorAvatar id={e.actorId} size="sm" className="mt-0.5" />
                  <div className="min-w-0 flex-1 text-sm leading-5">
                    <ActorName id={e.actorId} /> <span className="text-muted-foreground">{e.text}</span>
                    {e.href && (
                      <Link href={e.href} className="ml-1 text-signal underline-offset-2 hover:underline">
                        View
                      </Link>
                    )}
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="shrink-0 text-xs text-muted-foreground tabular">{relativeTime(e.at)}</span>
                    </TooltipTrigger>
                    <TooltipContent>{absoluteTime(e.at)}</TooltipContent>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Card>
    </div>
  )
}
