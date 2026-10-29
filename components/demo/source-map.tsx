"use client"

import * as React from "react"
import Link from "next/link"
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  useEdgesState,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { ArrowUpRight, Database, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogDescription, DialogTitle, SheetContent } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { ActorAvatar, ActorName } from "@/components/demo/actor"
import { SourceIcon } from "@/components/demo/source-icon"
import { VerdictPill, VERDICT_COLOR } from "@/components/demo/verdict-pill"
import { FreshnessSparkline } from "@/components/demo/sparkline"
import { PageHeader } from "@/components/demo/page"
import { SOURCES, SOURCE_TYPE_LABEL, VERDICT_LABEL, type Source, type Verdict } from "@/lib/demo/fixtures"
import { absoluteTime, fmtInt, relativeTime } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

type SourceNodeData = { source: Source; dim: boolean }
type TargetNodeData = { merged: boolean }

function SourceNode({ data, selected }: NodeProps<Node<SourceNodeData>>) {
  const s = data.source
  return (
    <div
      className={cn(
        "relative w-[236px] rounded-lg border bg-card shadow-sm transition-all duration-150 hover:shadow-md",
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        data.dim && "opacity-25",
      )}
    >
      <span className="absolute inset-y-0 left-0 w-1 rounded-l-lg" style={{ background: VERDICT_COLOR[s.verdict] }} />
      <Handle type="source" position={Position.Right} id="r" />
      <Handle type="target" position={Position.Left} id="l" />
      <Handle type="source" position={Position.Top} id="t" />
      <Handle type="target" position={Position.Bottom} id="b" />
      <Handle type="source" position={Position.Bottom} id="bs" />
      <Handle type="target" position={Position.Top} id="tt" />
      <div className="flex items-start gap-2.5 py-2.5 pl-3.5 pr-3">
        <SourceIcon type={s.type} size={16} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium leading-5">{s.name}</div>
          <div className="truncate text-[11px] text-muted-foreground">
            {SOURCE_TYPE_LABEL[s.type]} · {fmtInt(s.records)} {s.recordNoun}
          </div>
        </div>
        <ActorAvatar id={s.ownerId} size="xs" className="mt-0.5" />
      </div>
      <div className="flex items-center justify-between border-t px-3 py-1.5">
        <VerdictPill verdict={s.verdict} />
        <span className="text-[11px] text-muted-foreground tabular">{relativeTime(s.lastEdit)}</span>
      </div>
    </div>
  )
}

function TargetNode({ data }: NodeProps<Node<TargetNodeData>>) {
  return (
    <div className={cn("w-[220px] rounded-xl border-2 bg-card p-4 shadow-md transition-colors", data.merged ? "border-merged" : "border-signal")}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div className="flex items-center gap-2">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-white dark:text-ink", data.merged ? "bg-merged" : "bg-signal")}>
          <Database className="h-4 w-4" />
        </span>
        <div>
          <div className="text-[13px] font-semibold leading-5">Unified Client Record</div>
          <div className="text-[11px] text-muted-foreground">System of record</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-md bg-muted px-2 py-1">
          <div className="text-muted-foreground">Sources</div>
          <div className="font-mono font-medium tabular">{data.merged ? 4 : 1} / 10</div>
        </div>
        <div className="rounded-md bg-muted px-2 py-1">
          <div className="text-muted-foreground">Households</div>
          <div className="font-mono font-medium tabular">412</div>
        </div>
      </div>
    </div>
  )
}

function LabelNode({ data }: NodeProps<Node<{ text: string }>>) {
  return <div className="select-none text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{data.text}</div>
}

const nodeTypes = { source: SourceNode, target: TargetNode, label: LabelNode }

const COL = { attention: 40, ready: 420, target: 820 }
const ROW_H = 118

function buildNodes(merged: boolean, hidden: Set<Verdict>): Node[] {
  const attention = SOURCES.filter((s) => s.lane === "attention")
  const READY_ORDER = ["schwab-custodian-feed", "portfolio-db", "quickbooks-billing", "onboarding-tracker", "advisor-compensation"]
  const ready = READY_ORDER.map((slug) => SOURCES.find((s) => s.slug === slug)!)
  const nodes: Node[] = [
    { id: "label-attention", type: "label", position: { x: COL.attention, y: 8 }, data: { text: "Needs attention" }, draggable: false, selectable: false },
    { id: "label-ready", type: "label", position: { x: COL.ready, y: 8 }, data: { text: "Ready or governed" }, draggable: false, selectable: false },
    { id: "label-target", type: "label", position: { x: COL.target, y: 8 }, data: { text: "Target" }, draggable: false, selectable: false },
  ]
  attention.forEach((s, i) => nodes.push({ id: s.slug, type: "source", position: { x: COL.attention, y: 44 + i * ROW_H }, data: { source: s, dim: hidden.has(s.verdict) } }))
  ready.forEach((s, i) => nodes.push({ id: s.slug, type: "source", position: { x: COL.ready, y: 44 + i * ROW_H }, data: { source: s, dim: hidden.has(s.verdict) } }))
  const mid = 44 + ((Math.max(attention.length, ready.length) - 1) * ROW_H) / 2
  nodes.push({ id: "ucr", type: "target", position: { x: COL.target, y: mid - 30 }, data: { merged }, draggable: false })
  return nodes
}

function buildEdges(merged: boolean): Edge[] {
  const edges: Edge[] = []
  for (const s of SOURCES) {
    if (s.governed) edges.push({ id: `${s.slug}-ucr`, source: s.slug, sourceHandle: "r", target: "ucr", className: "edge-dep", type: "smoothstep" })
    else if (s.inMerge) edges.push({ id: `${s.slug}-ucr`, source: s.slug, sourceHandle: "r", target: "ucr", className: merged ? "edge-dep" : "edge-flow", type: "smoothstep", animated: false })
  }
  // Existing dependencies
  const labelStyle = (fill: string) => ({ labelStyle: { fontSize: 10, fill, fontFamily: "var(--font-mono)" }, labelBgStyle: { fill: "var(--background)" }, labelBgPadding: [4, 2] as [number, number] })
  edges.push({ id: "schwab-portfolio", source: "schwab-custodian-feed", sourceHandle: "bs", target: "portfolio-db", targetHandle: "tt", className: "edge-dep", type: "straight", label: "nightly ETL", ...labelStyle("var(--muted-foreground)") })
  edges.push({ id: "aum-sf", source: "aum-rollup", sourceHandle: "t", target: "salesforce-crm", targetHandle: "b", className: "edge-held", type: "straight", label: "40 conflicts", ...labelStyle("var(--flagged)") })
  edges.push({ id: "sf-onboarding", source: "salesforce-crm", sourceHandle: "r", target: "onboarding-tracker", targetHandle: "l", className: "edge-dep", type: "smoothstep", label: "household IDs", ...labelStyle("var(--muted-foreground)") })
  return edges
}

const MINI_COLOR: Record<Verdict, string> = { ready: "#2e6f4e", stale: "#9a6b00", conflict: "#a33a2c", unverified: "#6f6b63", restricted: "#16456b" }
const ALL_VERDICTS: Verdict[] = ["ready", "conflict", "stale", "unverified", "restricted"]

function MapInner() {
  const { state } = useDemo()
  const merged = state.mergeStatus === "merged"
  const [hidden, setHidden] = React.useState<Set<Verdict>>(new Set())
  const [selected, setSelected] = React.useState<Source | null>(null)
  const { fitView } = useReactFlow()

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(buildNodes(merged, hidden))
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(buildEdges(merged))

  React.useEffect(() => {
    setNodes((ns) =>
      ns.map((n) => {
        if (n.type === "source") {
          const d = n.data as SourceNodeData
          return { ...n, data: { ...d, dim: hidden.has(d.source.verdict) } }
        }
        if (n.type === "target") return { ...n, data: { merged } }
        return n
      }),
    )
    setEdges(buildEdges(merged))
  }, [merged, hidden, setNodes, setEdges])

  React.useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.18, duration: 0 }), 50)
    return () => clearTimeout(t)
  }, [fitView])

  const toggle = (v: Verdict) =>
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(v)) next.delete(v)
      else next.add(v)
      return next
    })

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between gap-4 px-6 pb-3 pt-6">
        <PageHeader title="Map" description="Ten sources, one target. Dashed edges are what MR-12 would merge; solid edges already exist." />
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-3 rounded-md border bg-card px-3 py-1.5 text-xs shadow-sm lg:flex">
            {ALL_VERDICTS.map((v) => (
              <button key={v} onClick={() => toggle(v)} className={cn("inline-flex items-center gap-1.5 transition-opacity", hidden.has(v) && "opacity-35 line-through")}>
                <span className="h-2 w-2 rounded-full" style={{ background: VERDICT_COLOR[v] }} />
                {VERDICT_LABEL[v]}
              </button>
            ))}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Show verdicts</DropdownMenuLabel>
              {ALL_VERDICTS.map((v) => (
                <DropdownMenuCheckboxItem key={v} checked={!hidden.has(v)} onCheckedChange={() => toggle(v)}>
                  {VERDICT_LABEL[v]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 border-t">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={(_, n) => {
            if (n.type === "source") setSelected((n.data as SourceNodeData).source)
          }}
          onPaneClick={() => setSelected(null)}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.4}
          maxZoom={1.6}
          proOptions={{ hideAttribution: true }}
          nodesConnectable={false}
          elementsSelectable
          deleteKeyCode={null}
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="color-mix(in srgb, var(--foreground) 12%, transparent)" />
          <Controls showInteractive={false} position="bottom-left" />
          <MiniMap
            position="bottom-right"
            pannable
            zoomable
            nodeColor={(n) => (n.type === "target" ? (merged ? "#6b4fbb" : "#16456b") : n.type === "label" ? "transparent" : MINI_COLOR[(n.data as SourceNodeData).source.verdict])}
            nodeStrokeWidth={0}
            maskColor="color-mix(in srgb, var(--background) 70%, transparent)"
          />
        </ReactFlow>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)} modal={false}>
        <SheetContent className="overflow-y-auto" overlay={false} onInteractOutside={(e) => { if ((e.target as HTMLElement)?.closest?.(".react-flow__node")) e.preventDefault() }}>
          {selected && <SourceSheet source={selected} />}
        </SheetContent>
      </Dialog>
    </div>
  )
}

function SourceSheet({ source: s }: { source: Source }) {
  const { state } = useDemo()
  const merged = state.mergeStatus === "merged"
  const rows: [string, React.ReactNode][] = [
    ["Owner", <span key="o" className="flex items-center gap-2"><ActorAvatar id={s.ownerId} size="xs" /><ActorName id={s.ownerId} withRole />{!s.ownerConfirmed && <Badge variant="gap">unconfirmed</Badge>}</span>],
    ["Update cadence", s.cadence],
    ["Last edit", `${absoluteTime(s.lastEdit)} · ${s.lastEditBy === s.ownerId ? "by owner" : `by ${s.lastEditBy}`}`],
    ["Records", `${fmtInt(s.records)} ${s.recordNoun}`],
    ["Location", <span key="l" className="font-mono text-xs">{s.location}</span>],
    ["Feeds", s.feeds.length ? s.feeds.join(", ") : <span className="text-muted-foreground">Nothing downstream</span>],
  ]
  return (
    <div className="flex flex-col">
      <div className="border-b p-5">
        <div className="flex items-start gap-3">
          <SourceIcon type={s.type} size={22} />
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base font-semibold leading-6">{s.name}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">{SOURCE_TYPE_LABEL[s.type]}</DialogDescription>
          </div>
          <VerdictPill verdict={s.verdict} className="mr-6" />
        </div>
      </div>
      <div className="space-y-5 p-5">
        <div className={cn("rounded-lg border p-3 text-sm", s.verdict === "ready" ? "border-verified/30 bg-verified-soft" : s.verdict === "conflict" ? "border-abort/30 bg-abort-soft" : "bg-muted")}>
          <div className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Verdict</div>
          <div className="font-medium">{s.verdict === "ready" ? (s.inMerge ? (merged ? "Merged in MR-12." : "Ready to merge. Included in MR-12.") : "Governed. Already the system of record.") : VERDICT_LABEL[s.verdict]}</div>
          <div className="mt-1 text-muted-foreground">{s.reason}</div>
        </div>
        <dl className="divide-y text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[120px_1fr] gap-3 py-2">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="min-w-0">{v}</dd>
            </div>
          ))}
        </dl>
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">Freshness · last 12 weeks</div>
          <FreshnessSparkline data={s.freshness} color={VERDICT_COLOR[s.verdict]} />
        </div>
        <Separator />
        <Button asChild variant="outline" className="w-full">
          <Link href={`/northfield/sources/${s.slug}`}>
            Open source page <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </div>
  )
}

export function SourceMap() {
  return (
    <ReactFlowProvider>
      <MapInner />
    </ReactFlowProvider>
  )
}
