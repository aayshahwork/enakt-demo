"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Cpu, Lock, Plug, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, UnderlineTabsList, UnderlineTabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ActorAvatar, getActor } from "@/components/demo/actor"
import { Card, CardHeader, PageHeader } from "@/components/demo/page"
import { SourceIcon } from "@/components/demo/source-icon"
import { CONNECTIONS, DEPLOYMENT, MODEL, SETTINGS_MEMBERS, SOURCE_BY_ID, href } from "@/lib/demo/fixtures"
import { relativeTime } from "@/lib/demo/format"
import { cn } from "@/lib/utils"

const TABS = ["deployment", "models", "members", "connections"] as const
type Tab = (typeof TABS)[number]

/** Reads ?tab= once (inside Suspense) and hands it to the page. */
function TabParam({ onTab }: { onTab: (t: Tab) => void }) {
  const params = useSearchParams()
  React.useEffect(() => {
    const t = params.get("tab") as Tab | null
    if (t && TABS.includes(t)) onTab(t)
  }, [params, onTab])
  return null
}

// ---------------------------------------------------------------------------
// Deployment
// ---------------------------------------------------------------------------

function FenceBox({ x, y, w, h, title, sub, tone = "default" }: { x: number; y: number; w: number; h: number; title: string; sub?: string; tone?: "default" | "verified" | "muted" }) {
  const stroke = tone === "verified" ? "var(--verified)" : tone === "muted" ? "var(--gap)" : "var(--border)"
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill="var(--card)" stroke={stroke} strokeWidth={tone === "verified" ? 2 : 1.25} strokeDasharray={tone === "muted" ? "4 4" : undefined} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 5 : h / 2 + 4)} textAnchor="middle" fontSize={12} fontWeight={600} fill={tone === "muted" ? "var(--muted-foreground)" : "var(--foreground)"} fontFamily="var(--font-body)">
        {title}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" fontSize={10.5} fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
          {sub}
        </text>
      )}
    </g>
  )
}

function FenceDiagram() {
  return (
    <svg viewBox="0 0 760 300" className="block w-full" role="img" aria-label="Network fence: Enakt, data sources, people and agents inside the Ashcombe network. Enakt Inc. and cloud model vendors outside, with no connection.">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="var(--signal)" />
        </marker>
      </defs>
      {/* Fence */}
      <rect x={16} y={34} width={470} height={250} rx={14} fill="var(--verified-soft)" fillOpacity={0.45} stroke="var(--verified)" strokeWidth={2} />
      <text x={32} y={56} fontSize={11} fontWeight={600} fill="var(--verified)" fontFamily="var(--font-body)" letterSpacing="0.06em">
        ASHCOMBE NETWORK
      </text>
      <text x={470} y={56} textAnchor="end" fontSize={10} fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
        firewall · 0 bytes out
      </text>

      <FenceBox x={40} y={78} w={190} h={64} title="Enakt" sub={`${MODEL.host} · ${MODEL.name}`} tone="verified" />
      <FenceBox x={272} y={78} w={190} h={64} title="12 data sources" sub="read in place, never copied" />
      <FenceBox x={156} y={196} w={190} h={64} title="People and agents" sub="scoped by policy, logged" />

      {/* Internal arrows */}
      <line x1={230} y1={110} x2={272} y2={110} stroke="var(--signal)" strokeWidth={1.5} markerEnd="url(#arr)" />
      <line x1={135} y1={142} x2={200} y2={196} stroke="var(--signal)" strokeWidth={1.5} markerEnd="url(#arr)" markerStart="url(#arr)" />
      <line x1={367} y1={142} x2={300} y2={196} stroke="var(--signal)" strokeWidth={1.5} markerEnd="url(#arr)" />

      {/* Outside */}
      <FenceBox x={556} y={78} w={190} h={64} title="Enakt Inc." sub="no data access" tone="muted" />
      <FenceBox x={556} y={196} w={190} h={64} title="Cloud model vendors" sub="off by policy" tone="muted" />

      {/* Crossed-out connectors */}
      <line x1={486} y1={110} x2={556} y2={110} stroke="var(--gap)" strokeWidth={1.25} strokeDasharray="4 4" />
      <g stroke="var(--abort)" strokeWidth={2} strokeLinecap="round">
        <line x1={514} y1={102} x2={528} y2={118} />
        <line x1={528} y1={102} x2={514} y2={118} />
      </g>
      <line x1={486} y1={228} x2={556} y2={228} stroke="var(--gap)" strokeWidth={1.25} strokeDasharray="4 4" />
      <g stroke="var(--abort)" strokeWidth={2} strokeLinecap="round">
        <line x1={514} y1={220} x2={528} y2={236} />
        <line x1={528} y1={220} x2={514} y2={236} />
      </g>
    </svg>
  )
}

function DeploymentTab() {
  const rows: [string, React.ReactNode][] = [
    [
      "Installed",
      <span key="i">
        {DEPLOYMENT.installedOn} <span className="font-mono text-xs text-muted-foreground">· {DEPLOYMENT.version}</span>
      </span>,
    ],
    ["Source reviewed", `${DEPLOYMENT.reviewer}, ${DEPLOYMENT.sourceReviewed}`],
    ["SSO", DEPLOYMENT.sso],
    [
      "Audit log",
      <span key="a" className="inline-flex items-center gap-2">
        On · retained 7 years
        <Link href={href("/audit")} className="text-xs text-signal underline-offset-4 hover:underline">
          Open log
        </Link>
      </span>,
    ],
    ["Egress", "0 bytes since Oct 21, measured at the firewall"],
    ["Update channel", "Signed offline bundle, applied by Ashcombe IT"],
  ]
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="mb-3 text-sm font-medium">Where Enakt runs</div>
        <FenceDiagram />
        <p className="mt-3 text-xs text-muted-foreground">Enakt is installed on Ashcombe hardware. It reads sources in place, runs models on the firm&apos;s own GPUs, and has no path to Enakt Inc. or any model vendor.</p>
      </Card>
      <Card>
        <dl className="divide-y text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[160px_1fr] gap-3 px-4 py-2.5">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="min-w-0">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

function ModelCard({ title, sub, checked, disabled, locked }: { title: string; sub: string; checked: boolean; disabled?: boolean; locked?: boolean }) {
  const [on, setOn] = React.useState(checked)
  const toggle = (
    <Switch checked={on} disabled={disabled} onCheckedChange={(v) => { setOn(v); toast(v ? `${title} enabled` : `${title} disabled`, { description: v ? "Routing restored on gpu-02." : "Requests queue until re-enabled." }) }} aria-label={title} />
  )
  return (
    <Card className="flex items-center gap-4 px-4 py-3.5">
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", locked ? "bg-muted text-muted-foreground" : "bg-verified-soft text-verified")}>
        {locked ? <Lock className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          {title}
          {locked ? <Badge variant="gap">disabled by policy</Badge> : on ? <Badge variant="verified">active</Badge> : <Badge variant="gap">off</Badge>}
        </div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      {locked ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">{toggle}</span>
          </TooltipTrigger>
          <TooltipContent>Locked by deployment policy; change requires Ashcombe security.</TooltipContent>
        </Tooltip>
      ) : (
        toggle
      )}
    </Card>
  )
}

function ModelsTab() {
  return (
    <div className="space-y-3">
      <ModelCard title={MODEL.name} sub={`${MODEL.host}, ${MODEL.rack} · 4× H100 · context 128k`} checked />
      <ModelCard title="Local embedding model" sub={`${MODEL.embed} · ${MODEL.host}`} checked />
      <ModelCard title="Cloud models" sub="No request can reach a cloud model vendor. Enforced at the firewall and in the router." checked={false} disabled locked />
      <div className="px-1 text-xs text-muted-foreground tabular">Today: 1,204 requests · p50 2.1s · 0 sent outside</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Members and connections
// ---------------------------------------------------------------------------

function MembersTab() {
  return (
    <Card className="overflow-hidden">
      <CardHeader
        title={`${SETTINGS_MEMBERS.length} members`}
        action={
          <Button size="sm" variant="outline" onClick={() => toast("Invites are managed by Ashcombe IT through SSO.")}>
            <UserPlus /> Invite member
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Member</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Seat</TableHead>
            <TableHead className="text-right">Last active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SETTINGS_MEMBERS.map((m) => {
            const a = getActor(m.id)
            return (
              <TableRow key={m.id}>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <ActorAvatar id={m.id} size="sm" />
                    <span>
                      <span className="block text-sm font-medium leading-5">{a.name}</span>
                      <span className="block text-xs text-muted-foreground">{a.role}</span>
                    </span>
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{a.email}</TableCell>
                <TableCell>
                  <Badge variant={m.seat === "Admin" ? "signal" : m.seat === "Compliance" ? "merged" : "outline"}>{m.seat}</Badge>
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground tabular">{relativeTime(m.lastActive)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}

function ConnectionsTab() {
  return (
    <Card className="overflow-hidden">
      <CardHeader
        title={`${CONNECTIONS.length} connections`}
        action={
          <Button size="sm" variant="outline" onClick={() => toast("New connections are discovered through intake, not configured by hand.")}>
            <Plug /> Add connection
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Source</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Owner</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {CONNECTIONS.map((c) => {
            const s = SOURCE_BY_ID[c.sourceId]
            return (
              <TableRow key={c.sourceId}>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <SourceIcon type={s.type} size={14} />
                    <span className="text-sm font-medium">{s.name}</span>
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.mode}</TableCell>
                <TableCell>
                  {c.status === "connected" ? (
                    <Badge variant="verified">Connected</Badge>
                  ) : c.status === "metadata" ? (
                    <Badge variant="gap">Metadata only</Badge>
                  ) : (
                    <Badge variant="merged">
                      <Lock className="h-3 w-3" /> Off by policy
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {s.ownerId ? <ActorAvatar id={s.ownerId} size="xs" className="ml-auto" /> : <span className="text-xs text-abort">No owner</span>}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [tab, setTab] = React.useState<Tab>("deployment")
  const onParam = React.useCallback((t: Tab) => setTab(t), [])

  const change = (t: string) => {
    setTab(t as Tab)
    router.replace(`${pathname}?tab=${t}`, { scroll: false })
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <React.Suspense fallback={null}>
        <TabParam onTab={onParam} />
      </React.Suspense>
      <PageHeader title="Settings" description="Deployment, models, members and connections for the Ashcombe workspace." />
      <Tabs value={tab} onValueChange={change}>
        <UnderlineTabsList>
          <UnderlineTabsTrigger value="deployment">Deployment</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="models">Models</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="members">Members</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="connections">Connections</UnderlineTabsTrigger>
        </UnderlineTabsList>
        <TabsContent value="deployment">
          <DeploymentTab />
        </TabsContent>
        <TabsContent value="models">
          <ModelsTab />
        </TabsContent>
        <TabsContent value="members">
          <MembersTab />
        </TabsContent>
        <TabsContent value="connections">
          <ConnectionsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
