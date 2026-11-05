"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Cloud, Cpu, Lock, Plug, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, UnderlineTabsList, UnderlineTabsTrigger } from "@/components/ui/tabs"
import { ActorAvatar, getActor } from "@/components/demo/actor"
import { Card, CardHeader, PageHeader } from "@/components/demo/page"
import { SourceIcon } from "@/components/demo/source-icon"
import { DEPLOYMENT, MODEL, SETTINGS_MEMBERS, SYSTEMS, href } from "@/lib/demo/fixtures"
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

function TenantDiagram() {
  return (
    <svg viewBox="0 0 760 300" className="block w-full" role="img" aria-label="Calloway Hill's Azure tenant holds Enakt, the model endpoint, the data sources and the people and agents. Enakt Inc. is outside with no account and no network path.">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="var(--signal)" />
        </marker>
      </defs>
      <rect x={16} y={34} width={470} height={250} rx={14} fill="var(--verified-soft)" fillOpacity={0.45} stroke="var(--verified)" strokeWidth={2} />
      <text x={32} y={56} fontSize={11} fontWeight={600} fill="var(--verified)" fontFamily="var(--font-body)" letterSpacing="0.06em">
        CALLOWAY HILL · AZURE TENANT · {DEPLOYMENT.region.toUpperCase()}
      </text>
      <text x={470} y={56} textAnchor="end" fontSize={10} fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
        egress to Enakt blocked
      </text>

      <FenceBox x={40} y={78} w={190} h={64} title="Enakt" sub={DEPLOYMENT.version} tone="verified" />
      <FenceBox x={272} y={78} w={190} h={64} title={MODEL.name} sub="in-tenant endpoint · no training" tone="verified" />
      <FenceBox x={40} y={196} w={190} h={64} title="12 data sources" sub="read in place, scoped per agent" />
      <FenceBox x={272} y={196} w={190} h={64} title="People and agents" sub="Entra ID · scoped, logged" />

      <line x1={230} y1={110} x2={272} y2={110} stroke="var(--signal)" strokeWidth={1.5} markerEnd="url(#arr)" markerStart="url(#arr)" />
      <line x1={135} y1={142} x2={135} y2={196} stroke="var(--signal)" strokeWidth={1.5} markerEnd="url(#arr)" />
      <line x1={367} y1={142} x2={367} y2={196} stroke="var(--signal)" strokeWidth={1.5} markerEnd="url(#arr)" markerStart="url(#arr)" />

      <FenceBox x={556} y={78} w={190} h={64} title="Enakt Inc." sub="no accounts · no access" tone="muted" />
      <FenceBox x={556} y={196} w={190} h={64} title="Other model vendors" sub="not configured" tone="muted" />

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
    ["Tenant", `${DEPLOYMENT.tenant} · region ${DEPLOYMENT.region}`],
    [
      "Installed",
      <span key="i">
        {DEPLOYMENT.installedOn} by {DEPLOYMENT.installedBy} <span className="font-mono text-xs text-muted-foreground">· {DEPLOYMENT.version}</span>
      </span>,
    ],
    ["Enakt Inc. accounts", <Badge key="e" variant="verified">{DEPLOYMENT.enaktAccounts}</Badge>],
    ["Identity", DEPLOYMENT.sso],
    ["Network", "Egress to Enakt blocked at the tenant firewall · model calls stay in-tenant"],
    [
      "Audit log",
      <span key="a" className="inline-flex items-center gap-2">
        On · retained 7 years
        <Link href={href("/audit")} className="text-xs text-signal underline-offset-4 hover:underline">
          Open log
        </Link>
      </span>,
    ],
    ["Update channel", "Signed release, applied by Calloway Hill IT"],
  ]
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="mb-3 text-sm font-medium">Where Enakt runs</div>
        <TenantDiagram />
        <p className="mt-3 text-xs text-muted-foreground">Enakt runs in Calloway Hill&apos;s Azure tenant. It reads sources in place, calls the in-tenant model endpoint, and has no account, key or network path to Enakt Inc.</p>
      </Card>
      <Card>
        <dl className="divide-y text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[170px_1fr] gap-3 px-4 py-2.5">
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

function ModelCard({ title, sub, checked, icon: Icon }: { title: string; sub: string; checked: boolean; icon: React.ComponentType<{ className?: string }> }) {
  const [on, setOn] = React.useState(checked)
  return (
    <Card className="flex items-center gap-4 px-4 py-3.5">
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", on ? "bg-verified-soft text-verified" : "bg-muted text-muted-foreground")}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          {title}
          {on ? <Badge variant="verified">active</Badge> : <Badge variant="gap">off</Badge>}
        </div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <Switch
        checked={on}
        onCheckedChange={(v) => {
          setOn(v)
          toast(v ? `${title} enabled` : `${title} disabled`, { description: v ? "Requests route here from the model gateway." : "Requests queue until re-enabled." })
        }}
        aria-label={title}
      />
    </Card>
  )
}

function ModelsTab() {
  return (
    <div className="space-y-3">
      <ModelCard title={MODEL.name} sub={`In-tenant endpoint · ${MODEL.region} · ${MODEL.note} · prompts and outputs stay in the tenant`} checked icon={Cloud} />
      <ModelCard title={MODEL.localEndpoint} sub="Available for a self-hosted model on the firm's own compute · not configured" checked={false} icon={Cpu} />
      <Card className="flex items-center gap-4 px-4 py-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Lock className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            Model gateway <Badge variant="merged">policy</Badge>
          </div>
          <div className="text-xs text-muted-foreground">Every agent call passes the gateway, which denies tools outside the agent&apos;s scope before any request reaches a model.</div>
        </div>
      </Card>
      <div className="px-1 text-xs text-muted-foreground tabular">Today: 318 requests · p50 2.4s · 0 outside the tenant</div>
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
        title={`${SETTINGS_MEMBERS.length} members · 35 seats available`}
        action={
          <Button size="sm" variant="outline" onClick={() => toast("Invites are managed by Calloway Hill IT through Entra ID.")}>
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
                  <Badge variant={m.seat === "Admin" ? "signal" : m.seat === "Compliance" ? "merged" : m.seat === "Partner" ? "verified" : "outline"}>{m.seat}</Badge>
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
        title={`${SYSTEMS.length} systems`}
        action={
          <Button size="sm" variant="outline" onClick={() => toast("New systems are connected metadata-first, then scoped per agent through a connection request.")}>
            <Plug /> Add system
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>System</TableHead>
            <TableHead>Scope</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead className="text-right">Last sync</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SYSTEMS.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <span className="inline-flex items-center gap-2">
                  <SourceIcon type={c.type} size={14} />
                  <span className="text-sm font-medium">{c.name}</span>
                </span>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{c.detail}</TableCell>
              <TableCell>
                {c.mode === "scoped" ? (
                  <Badge variant="verified">scoped read</Badge>
                ) : c.mode === "metadata" ? (
                  <Badge variant="gap">metadata only</Badge>
                ) : (
                  <Badge variant="outline">
                    <Lock className="h-3 w-3" /> not connected
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right text-xs text-muted-foreground tabular">{c.lastSync ? `synced ${relativeTime(c.lastSync)}` : "—"}</TableCell>
            </TableRow>
          ))}
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
      <PageHeader title="Settings" description="Deployment, models, members and connected systems for the Calloway Hill workspace." />
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
