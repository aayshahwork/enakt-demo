"use client"

import * as React from "react"
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getSmoothStepPath,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { motion } from "framer-motion"
import { AlertTriangle, Bot, HelpCircle, Lock, ShieldCheck, Sparkles } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ActorAvatar } from "@/components/demo/actor"
import { SourceIcon } from "@/components/demo/source-icon"
import { AgentStatusPill, VERDICT_COLOR, VerdictPill } from "@/components/demo/verdict-pill"
import {
  AGENTS,
  EDGE_BY_ID,
  LANES,
  LAYOUT,
  POLICY_BY_ID,
  SOURCES,
  VIEW_AGENTS,
  VIEW_SCOPE,
  agentPos,
  lanePos,
  slotPos,
  sourceAbsPos,
  type Actor,
  type AgentStatus,
  type EdgeKind,
  type Lane,
  type Source,
  type SourceId,
  type Verdict,
} from "@/lib/demo/fixtures"
import { fmtInt } from "@/lib/demo/format"
import { useDemo, type NodeState } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Node components
// ---------------------------------------------------------------------------

type LaneNodeData = { lane: Lane; policies: string[]; hidden: boolean; scoped: boolean }
type SourceNodeData = { source: Source; state: NodeState; hidden: boolean; scoped: boolean; live: boolean }
type AgentNodeData = { agent: Actor; status: AgentStatus; hidden: boolean; scopeCount: number }

const ENTER = { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.3, ease: "easeOut" as const } }

function PolicyBadges({ ids, className }: { ids: string[]; className?: string }) {
  if (!ids.length) return null
  return (
    <div className={cn("absolute -right-2 -top-2.5 flex gap-1", className)}>
      {ids.map((id, i) => (
        <Tooltip key={id}>
          <TooltipTrigger asChild>
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut", delay: i * 0.05 }}
              className="flex h-6 items-center gap-1 rounded-full border border-merged/40 bg-merged px-1.5 text-[10px] font-medium text-white shadow-sm dark:text-ink"
            >
              <ShieldCheck className="h-3 w-3" /> Policy
            </motion.span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[280px]">
            <span className="font-medium">Policy.</span> {POLICY_BY_ID[id]?.rule}. Enforced at the source.
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

function LaneNode({ data }: NodeProps<Node<LaneNodeData>>) {
  const { lane, policies, hidden, scoped } = data
  return (
    <motion.div
      {...ENTER}
      animate={{ opacity: hidden ? 0 : 1, scale: hidden ? 0.98 : 1 }}
      className={cn("relative h-full w-full rounded-xl border bg-muted/35 transition-colors duration-300", scoped && "border-signal/50 bg-signal-soft/30", policies.length > 0 && !scoped && "border-merged/40")}
      style={{ width: LAYOUT.laneW, height: LAYOUT.laneH }}
    >
      <div className="flex items-baseline gap-2 px-4 pt-2.5">
        <span className="text-[12px] font-semibold tracking-[-0.01em]">{lane.label}</span>
        <span className="truncate text-[11px] text-muted-foreground">{lane.sub}</span>
        {scoped && <span className="ml-auto font-mono text-[10px] text-signal">read-only</span>}
      </div>
      <PolicyBadges ids={policies} />
    </motion.div>
  )
}

function SourceNode({ data, selected }: NodeProps<Node<SourceNodeData>>) {
  const { source: s, state, hidden, scoped, live } = data
  const placeholder = state.placeholder
  const verdict = state.verdict
  const red = verdict === "restricted"
  return (
    <motion.div
      {...ENTER}
      animate={{ opacity: hidden ? 0 : 1, scale: hidden ? 0.92 : 1 }}
      className={cn(
        "relative rounded-lg border bg-card shadow-sm transition-shadow duration-150 hover:shadow-md",
        placeholder && "border-dashed border-gap/60 bg-muted/40 shadow-none",
        verdict === "unchecked" && !placeholder && "border-dashed",
        live && "border-verified/50",
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
      )}
      style={{ width: LAYOUT.nodeW, height: LAYOUT.nodeH }}
    >
      <span className="absolute inset-y-0 left-0 w-1 rounded-l-lg transition-colors duration-300" style={{ background: placeholder || verdict === "unchecked" ? "transparent" : VERDICT_COLOR[verdict] }} />
      <Handle type="source" position={Position.Right} id="r" />
      <Handle type="target" position={Position.Left} id="l" />
      <Handle type="source" position={Position.Left} id="ls" />
      <Handle type="target" position={Position.Right} id="rt" />
      <Handle type="source" position={Position.Top} id="t" />
      <Handle type="target" position={Position.Top} id="tt" />
      <Handle type="source" position={Position.Bottom} id="b" />
      <Handle type="target" position={Position.Bottom} id="bt" />

      {placeholder ? (
        <div className="flex h-full items-center gap-2.5 py-2.5 pl-3.5 pr-3">
          <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <HelpCircle className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium leading-5 text-muted-foreground">{placeholder.label}</div>
            <div className="truncate text-[11px] italic text-muted-foreground">{placeholder.hint}</div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-2.5 py-2 pl-3.5 pr-3">
            <SourceIcon type={s.type} size={15} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium leading-5">{s.name}</div>
              <div className="truncate font-mono text-[10.5px] text-muted-foreground">
                {scoped && s.id === "deal-records" ? "WHERE deal_id = 'ATLAS'" : `${fmtInt(s.records)} ${s.recordNoun}`}
              </div>
            </div>
            <ActorAvatar id={s.ownerId} size="xs" className="mt-0.5" />
          </div>
          <div className="flex items-center justify-between px-3 pb-1.5">
            <VerdictPill verdict={verdict} className="h-[18px] px-1.5 text-[10px]" />
            {red && <Lock className="h-3.5 w-3.5 text-abort" />}
            {verdict === "conflict" && <AlertTriangle className="h-3.5 w-3.5 text-abort" />}
          </div>
        </>
      )}
    </motion.div>
  )
}

function AgentNode({ data }: NodeProps<Node<AgentNodeData>>) {
  const { agent, status, hidden, scopeCount } = data
  return (
    <motion.div
      {...ENTER}
      animate={{ opacity: hidden ? 0 : 1, scale: hidden ? 0.92 : 1 }}
      className={cn(
        "relative rounded-lg border-2 bg-card shadow-sm transition-colors duration-500",
        status === "live" ? "border-verified" : status === "build" ? "border-dashed border-signal/60" : status === "blocked" ? "border-dashed border-abort/50" : "border-dashed",
      )}
      style={{ width: LAYOUT.nodeW, height: LAYOUT.nodeH }}
    >
      <Handle type="source" position={Position.Left} id="ls" />
      <Handle type="target" position={Position.Left} id="l" />
      <div className="flex h-full items-center gap-2.5 px-3">
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white transition-colors duration-500 dark:text-ink", status === "live" ? "bg-verified" : status === "build" ? "bg-signal" : status === "blocked" ? "bg-abort" : "bg-gap")}>
          <Bot className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-mono text-[12px] font-medium leading-5">{agent.name}</div>
          <div className="truncate text-[10.5px] text-muted-foreground">{status === "live" ? `${scopeCount} sources · read-only` : status === "build" ? `${scopeCount} sources proposed · CR-7` : status === "blocked" ? "needs red data · CCO" : "queued · KPI cleanup"}</div>
        </div>
        <AgentStatusPill status={status} className="h-[18px] px-1.5 text-[10px]" />
      </div>
    </motion.div>
  )
}

const nodeTypes = { lane: LaneNode, source: SourceNode, agent: AgentNode }

// ---------------------------------------------------------------------------
// Edge component: draws in, then settles into the style for its kind
// ---------------------------------------------------------------------------

const EDGE_STROKE: Record<EdgeKind, string> = { scope: "var(--signal)", requested: "var(--gap)", blocked: "var(--abort)", dep: "var(--flagged)" }

function DrawEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps<Edge<{ kind: EdgeKind; live: boolean; hidden: boolean }>>) {
  const [path] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, borderRadius: 10 })
  const [drawn, setDrawn] = React.useState(false)
  React.useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 560)
    return () => clearTimeout(t)
  }, [])
  const kind = data?.kind ?? "scope"
  const live = !!data?.live
  const stroke = live ? "var(--verified)" : EDGE_STROKE[kind]
  if (drawn) {
    return <BaseEdge id={id} path={path} className={live ? "edge-live" : `edge-${kind}`} style={{ stroke }} />
  }
  return <motion.path d={path} fill="none" stroke={stroke} strokeWidth={1.5} initial={{ pathLength: 0, opacity: 0.2 }} animate={{ pathLength: 1, opacity: 0.85 }} transition={{ duration: 0.5, ease: "easeOut" }} />
}

const edgeTypes = { draw: DrawEdge }

// ---------------------------------------------------------------------------
// Graph assembly
// ---------------------------------------------------------------------------

function posOf(id: string) {
  if (AGENTS[id]) return agentPos(id)
  return sourceAbsPos(id as SourceId)
}

/** Pick handles from relative positions so edges leave and enter on sensible sides. */
function handlesFor(a: string, b: string): { sourceHandle: string; targetHandle: string } {
  const pa = posOf(a)
  const pb = posOf(b)
  const dx = pb.x - pa.x
  const dy = pb.y - pa.y
  if (dx > LAYOUT.nodeW * 0.6) return { sourceHandle: "r", targetHandle: "l" }
  if (dx < -LAYOUT.nodeW * 0.6) return { sourceHandle: "ls", targetHandle: "rt" }
  if (dy > LAYOUT.nodeH) return { sourceHandle: "b", targetHandle: "tt" }
  return { sourceHandle: "t", targetHandle: "bt" }
}

export type CanvasMode = "request" | "map"

type Props = {
  mode: CanvasMode
  selectedId?: SourceId | null
  onSelect?: (id: SourceId | null) => void
  /** fitView padding: a fraction, or pixels per side. */
  padding?: number | { top?: `${number}px`; bottom?: `${number}px`; left?: `${number}px`; right?: `${number}px` }
  /** Verdicts toggled off in the legend. */
  hiddenVerdicts?: Set<Verdict>
}

function CanvasInner({ mode, selectedId, onSelect, padding = 0.14, hiddenVerdicts }: Props) {
  const fitPadding = typeof padding === "number" ? padding : { ...padding }
  const laneIds = useDemo((s) => s.lanes)
  const lanePolicies = useDemo((s) => s.lanePolicies)
  const nodeStates = useDemo((s) => s.nodes)
  const edgeIds = useDemo((s) => s.edges)
  const agentIds = useDemo((s) => s.agents)
  const liveAgents = useDemo((s) => s.liveAgents)
  const viewAs = useDemo((s) => s.viewAs)
  const { fitView } = useReactFlow()

  const scope = mode === "map" ? VIEW_SCOPE[viewAs] : "all"
  const agentScope = mode === "map" ? VIEW_AGENTS[viewAs] : "all"
  const scopedView = mode === "map" && viewAs === "atlas-memo-agent"
  const visible = (id: string) => scope === "all" || scope.includes(id as SourceId)
  const hiddenBy = (id: string) => mode === "map" && !!hiddenVerdicts?.has(nodeStates[id]?.verdict ?? "unchecked")
  const sourceHidden = (id: string) => !visible(id) || hiddenBy(id)
  const agentVisible = (id: string) => agentScope === "all" || agentScope.includes(id)
  const agentStatus = (id: string): AgentStatus => (liveAgents.includes(id) ? "live" : (AGENTS[id]?.status ?? "queued"))

  const nodes = React.useMemo<Node[]>(() => {
    const out: Node[] = []
    for (const lane of LANES) {
      if (!laneIds.includes(lane.id)) continue
      const members = SOURCES.filter((s) => s.lane === lane.id && nodeStates[s.id])
      const anyVisible = members.some((s) => !sourceHidden(s.id))
      const hidden = members.length > 0 && !anyVisible
      out.push({
        id: `lane:${lane.id}`,
        type: "lane",
        position: lanePos(lane.id),
        initialWidth: LAYOUT.laneW,
        initialHeight: LAYOUT.laneH,
        draggable: false,
        selectable: false,
        className: hidden ? "hidden-node" : undefined,
        data: { lane, policies: lanePolicies[lane.id] ?? [], hidden, scoped: scopedView && lane.id === "atlas" } satisfies LaneNodeData,
      })
    }
    for (const s of SOURCES) {
      const st = nodeStates[s.id]
      if (!st || !laneIds.includes(s.lane)) continue
      const hidden = sourceHidden(s.id)
      const live = liveAgents.some((a) => AGENTS[a]?.scope?.includes(s.id))
      out.push({
        id: s.id,
        type: "source",
        parentId: `lane:${s.lane}`,
        extent: "parent",
        position: slotPos(s.slot),
        initialWidth: LAYOUT.nodeW,
        initialHeight: LAYOUT.nodeH,
        draggable: false,
        selected: selectedId === s.id,
        className: hidden ? "hidden-node" : undefined,
        data: { source: s, state: st, hidden, scoped: scopedView, live } satisfies SourceNodeData,
      })
    }
    for (const id of agentIds) {
      const agent = AGENTS[id]
      if (!agent) continue
      const hidden = !agentVisible(id)
      out.push({
        id,
        type: "agent",
        position: agentPos(id),
        initialWidth: LAYOUT.nodeW,
        initialHeight: LAYOUT.nodeH,
        draggable: false,
        selectable: false,
        className: hidden ? "hidden-node" : undefined,
        data: { agent, status: agentStatus(id), hidden, scopeCount: agent.scope?.length ?? 0 } satisfies AgentNodeData,
      })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laneIds, lanePolicies, nodeStates, agentIds, liveAgents, viewAs, mode, selectedId, hiddenVerdicts])

  const edges = React.useMemo<Edge[]>(() => {
    const out: Edge[] = []
    for (const id of edgeIds) {
      const e = EDGE_BY_ID[id]
      if (!e) continue
      const srcIsAgent = !!AGENTS[e.source]
      if (srcIsAgent ? !agentIds.includes(e.source) : !nodeStates[e.source]) continue
      if (!nodeStates[e.target]) continue
      const hidden = (srcIsAgent ? !agentVisible(e.source) : sourceHidden(e.source)) || sourceHidden(e.target)
      const live = srcIsAgent && liveAgents.includes(e.source)
      out.push({ id, source: e.source, target: e.target, type: "draw", ...handlesFor(e.source, e.target), className: hidden ? "edge-hidden" : undefined, data: { kind: e.kind, live, hidden } })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edgeIds, nodeStates, agentIds, liveAgents, viewAs, mode, hiddenVerdicts])

  // Gentle re-fit whenever something lands or the viewer changes.
  const visibleKey = nodes.filter((n) => !(n.data as { hidden: boolean }).hidden).map((n) => n.id).join(",")
  const fit = React.useCallback(
    (duration = 400) => {
      const visibleNodes = nodes.filter((n) => !(n.data as { hidden: boolean }).hidden && n.type !== "source").map((n) => ({ id: n.id }))
      if (!visibleNodes.length) return
      fitView({ duration, padding: fitPadding, nodes: visibleNodes, maxZoom: 1.05 })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fitView, nodes, JSON.stringify(padding)],
  )
  React.useEffect(() => {
    const t = setTimeout(() => fit(400), 60)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleKey, mode])

  // Re-fit when the pane resizes (request → map hands the canvas the full width).
  const wrapRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    let last = el.clientWidth
    const ro = new ResizeObserver(() => {
      if (Math.abs(el.clientWidth - last) < 8) return
      last = el.clientWidth
      fit(300)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [fit])

  const empty = nodes.length === 0

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, n) => {
          if (n.type === "source" && !(n.data as SourceNodeData).hidden) onSelect?.(n.id as SourceId)
        }}
        onPaneClick={() => onSelect?.(null)}
        fitView
        fitViewOptions={{ padding: fitPadding }}
        minZoom={0.3}
        maxZoom={1.6}
        nodesConnectable={false}
        nodesDraggable={false}
        elementsSelectable={mode === "map"}
        deleteKeyCode={null}
        zoomOnDoubleClick={false}
        panOnScroll
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="color-mix(in srgb, var(--foreground) 12%, transparent)" />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>
      {empty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl border border-dashed bg-card/80 px-6 py-5 text-center shadow-sm backdrop-blur">
            <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-signal-soft text-signal">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="text-sm font-medium">Nothing mapped yet</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Start the scope plan and the deal lanes build here as the request is scoped.</div>
          </div>
        </div>
      )}
    </div>
  )
}

export function DealCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  )
}

