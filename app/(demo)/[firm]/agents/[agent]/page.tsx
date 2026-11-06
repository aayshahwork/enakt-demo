"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ChevronDown, Lock, Rocket, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, UnderlineTabsList, UnderlineTabsTrigger } from "@/components/ui/tabs"
import { ActorAvatar, ActorName } from "@/components/demo/actor"
import { Card, CardHeader, EmptyState, PageHeader } from "@/components/demo/page"
import { ColourPill, StagePill } from "@/components/demo/status-pill"
import { ACCESS_LABEL, ACTIVITY, BUILD_STEPS, CURRENT_USER, EVAL_TREND, HERO, OTHER_AGENTS, PERMISSIONS, SOURCE_BY_ID, colourFor, href, type Access, type Permission } from "@/lib/demo/fixtures"
import { relativeTime } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

const ACCESS_VARIANT: Record<Access, "verified" | "signal" | "flagged" | "abort"> = { read: "verified", write: "signal", ask: "flagged", none: "abort" }

function PermissionRow({ p }: { p: Permission }) {
  const [open, setOpen] = React.useState(false)
  const writeEnabled = useDemo((s) => s.writeEnabled)
  const setWrite = useDemo((s) => s.setWrite)
  const overrides = useDemo((s) => s.overrides)
  const s = SOURCE_BY_ID[p.sourceId]
  const colour = colourFor(s.id, CURRENT_USER.id, overrides)
  const access: Access = p.adjustable === "write" && !writeEnabled ? "read" : p.access
  const name = colour === "black" ? `Restricted · ${s.name.replace(" data room", "")}` : s.name
  return (
    <li className="px-4 py-2.5">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 text-left" aria-expanded={open}>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{name}</span>
            <ColourPill colour={colour} className="h-[18px] px-1.5 text-[10px]" />
          </div>
          <div className="truncate text-xs text-muted-foreground">{s.system}</div>
        </div>
        <Badge variant={ACCESS_VARIANT[access]} className="w-[108px] justify-center">
          {access === "none" && <Lock className="h-3 w-3" />}
          {ACCESS_LABEL[access]}
        </Badge>
        <span className="hidden w-[128px] items-center gap-1 text-[11px] text-muted-foreground lg:inline-flex">
          <ShieldCheck className="h-3 w-3 text-verified" /> Enforced at source
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
            <div className="ml-6 mt-2 rounded-md border bg-muted/40 px-3 py-2 text-xs leading-5">{p.how}</div>
          </motion.div>
        )}
      </AnimatePresence>
      {p.adjustable === "write" && (
        <div className="ml-6 mt-2 flex items-center gap-3 rounded-md border bg-card px-3 py-2 text-xs">
          <Switch checked={writeEnabled} onCheckedChange={setWrite} aria-label="Post screens to DealCloud" id="write-toggle" />
          <span className="flex-1">
            <span className="font-medium">Post screens to DealCloud</span>
            <span className="text-muted-foreground"> · {writeEnabled ? "on. Each screen lands on the deal record." : "off. Screens come to Maya’s inbox first."}</span>
          </span>
          <span className="text-muted-foreground">Changeable any time</span>
        </div>
      )}
    </li>
  )
}

function PermissionsTab() {
  const [showOut, setShowOut] = React.useState(false)
  const inScope = PERMISSIONS.filter((p) => p.inScope)
  const excluded = PERMISSIONS.filter((p) => !p.inScope && (p.sourceId === "dr-atlas" || p.sourceId === "lp-records"))
  const out = PERMISSIONS.filter((p) => !p.inScope && !excluded.includes(p))
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="What the agent can touch" action={<span className="text-xs text-muted-foreground">write is limited to posting screens</span>} />
        <ul className="divide-y">
          {inScope.map((p) => (
            <PermissionRow key={p.sourceId} p={p} />
          ))}
        </ul>
      </Card>
      <Card>
        <CardHeader title="Excluded by policy" action={<span className="text-xs text-muted-foreground">no way to read these, enforced by the source&apos;s own access rules</span>} />
        <ul className="divide-y">
          {excluded.map((p) => (
            <PermissionRow key={p.sourceId} p={p} />
          ))}
        </ul>
      </Card>
      <Card>
        <button type="button" onClick={() => setShowOut((o) => !o)} className="flex w-full items-center justify-between px-4 py-3 text-sm" aria-expanded={showOut}>
          <span className="font-medium">Not in scope ({out.length})</span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showOut && "rotate-180")} />
        </button>
        {showOut && (
          <ul className="divide-y border-t">
            {out.map((p) => (
              <PermissionRow key={p.sourceId} p={p} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function EvaluationTab() {
  const deployed = useDemo((s) => s.deployStatus === "deployed")
  const runDone = useDemo((s) => s.seq.run === "done")
  if (!deployed) {
    return <EmptyState icon={ShieldCheck} title="Evaluation not started" description={`Test set ready: ${BUILD_STEPS[6].result}. Runs on first deploy, then on every reviewed screen.`} />
  }
  return (
    <Card>
      <CardHeader title="Agreement with partner decisions" action={<span className="text-xs text-muted-foreground">illustrative</span>} />
      <div className="p-4 text-sm">
        <p className="text-muted-foreground">{runDone ? "1 screen produced, awaiting Maya’s review. The trend below is what the firm’s trained screener shows after 120 reviewed screens." : "Deployed. The first screen has not run yet."}</p>
        <ul className="mt-3 grid grid-cols-5 gap-2 text-center">
          {EVAL_TREND.map((e) => (
            <li key={e.screens} className="rounded-md border bg-muted/30 px-2 py-2">
              <div className="font-mono text-lg font-medium tabular text-verified">{e.agreement}%</div>
              <div className="text-[11px] text-muted-foreground">{e.screens} screens</div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

function ActivityTab() {
  const extraActivity = useDemo((s) => s.extraActivity)
  const activity = React.useMemo(() => [...extraActivity, ...ACTIVITY], [extraActivity])
  const rows = activity.filter((a) => a.text.toLowerCase().includes("cim screener") || a.text.toLowerCase().includes("juniper") || a.kind === "blocked")
  if (rows.length === 0) return <EmptyState icon={ShieldCheck} title="No activity yet" description="Every read, block and post by this agent shows here with its source." />
  return (
    <Card>
      <ul className="divide-y">
        {rows.map((a) => (
          <li key={a.id} className="flex items-start gap-2.5 px-4 py-2.5 text-sm">
            <ActorAvatar id={a.actorId} size="sm" className="mt-0.5" />
            <span className="min-w-0 flex-1 leading-5">
              <ActorName id={a.actorId} /> <span className={cn(a.kind === "blocked" ? "text-abort" : "text-muted-foreground")}>{a.text}</span>
            </span>
            <span className="shrink-0 text-xs text-muted-foreground tabular">{relativeTime(a.at)}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default function AgentPage() {
  const params = useParams<{ agent: string }>()
  const agentId = params?.agent ?? ""
  const heroStage = useDemo((s) => s.heroStage)
  const deployed = useDemo((s) => s.deployStatus === "deployed")
  const isHero = agentId === HERO.id
  const other = OTHER_AGENTS.find((a) => a.id === agentId)

  if (!isHero && !other) {
    return (
      <div className="mx-auto w-full max-w-6xl p-6">
        <EmptyState icon={ShieldCheck} title="No such agent" description="Agents in this workspace are listed on the Agents page." action={<Button asChild variant="outline" size="sm"><Link href={href("/agents")}><ArrowLeft /> All agents</Link></Button>} />
      </div>
    )
  }

  if (other) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-5 p-6">
        <Link href={href("/agents")} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Agents
        </Link>
        <PageHeader title={other.name} description={other.purpose} actions={<StagePill stage={other.stage} />} />
        <EmptyState icon={ShieldCheck} title={`${other.name} is ${other.stage === "requested" ? "waiting to be scoped" : other.stage}`} description="The security review, evaluation and activity appear once it is built." />
      </div>
    )
  }

  const stage = heroStage ?? "requested"
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 p-6">
      <Link href={href("/agents")} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Agents
      </Link>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2.5">
            {HERO.name} <StagePill stage={stage} />
          </span>
        }
        description={HERO.purpose}
        actions={
          deployed ? (
            <Button asChild size="sm" variant="outline">
              <Link href={href("/agents/cim-screener/run")}>See it run on a new CIM</Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="signal">
              <Link href={href("/agents/cim-screener/deploy")} id="to-deploy">
                <Rocket /> Deploy to firm
              </Link>
            </Button>
          )
        }
      />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        Requested by <ActorAvatar id={HERO.requesterId} size="xs" /> <ActorName id={HERO.requesterId} className="text-xs" /> · request {HERO.requestId.toUpperCase()} · reviewed by Maya every screen for two weeks, then a weekly sample
      </div>
      <Tabs defaultValue="permissions">
        <UnderlineTabsList>
          <UnderlineTabsTrigger value="permissions">Permissions</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="evaluation">Evaluation</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="activity">Activity</UnderlineTabsTrigger>
        </UnderlineTabsList>
        <TabsContent value="permissions">
          <PermissionsTab />
        </TabsContent>
        <TabsContent value="evaluation">
          <EvaluationTab />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
