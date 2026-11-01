"use client"

import * as React from "react"
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  Handle,
  MiniMap,
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
import { Brain, HelpCircle, Lock, ShieldCheck, UserX } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ActorAvatar } from "@/components/demo/actor"
import { SourceIcon } from "@/components/demo/source-icon"
import { VerdictPill, VERDICT_COLOR, VERDICT_HEX } from "@/components/demo/verdict-pill"
import { BRAIN, BRAIN_POS, DEP_EDGES, POLICY_BY_ID, SOURCE_BY_ID, SOURCES, VIEW_SCOPE, type Source, type SourceId, type Verdict } from "@/lib/demo/fixtures"
import { fmtInt } from "@/lib/demo/format"
import { useDemo, type NodeState } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Node components
// ---------------------------------------------------------------------------

type SourceNodeData = { source: Source; state: NodeState; hidden: boolean }
type BrainNodeData = { merged: number; policies: string[]; hidden: boolean; scoped: boolean; listening: boolean }

const ENTER = { initial: { opacity: 0, scale: 0.86 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.3, ease: "easeOut" as const } }

function PolicyBadges({ ids, className }: { ids: string[]; className?: string }) {
  if (!ids.length) return null
  return (
    <div className={cn("absolute -right-2 -top-2 flex gap-1", className)}>
      {ids.map((id, i) => (
        <Tooltip key={id}>
          <TooltipTrigger asChild>
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut", delay: i * 0.05 }}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-merged/40 bg-merged text-white shadow-sm dark:text-ink"
            >
              <ShieldCheck className="h-3 w-3" />
            </motion.span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[260px]">
            <span className="font-medium">Policy.</span> {POLICY_BY_ID[id]?.rule}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

function SourceNode({ data, selected }: NodeProps<Node<SourceNodeData>>) {
  const { source: s, state, hidden } = data
  const placeholder = state.placeholder
  const verdict = state.verdict
  return (
    <motion.div
      {...ENTER}
      animate={{ opacity: hidden ? 0 : 1, scale: hidden ? 0.92 : 1 }}
      className={cn(
        "relative w-[212px] rounded-lg border bg-card shadow-sm transition-shadow duration-150 hover:shadow-md",
        placeholder && "border-dashed border-gap/60 bg-muted/40 shadow-none",
        verdict === "unchecked" && !placeholder && "border-dashed",
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
      )}
    >
      <span className="absolute inset-y-0 left-0 w-1 rounded-l-lg transition-colors duration-300" style={{ background: placeholder ? "transparent" : VERDICT_COLOR[verdict] }} />
      <Handle type="source" position={Position.Right} id="r" />
      <Handle type="target" position={Position.Left} id="l" />
      <Handle type="source" position={Position.Left} id="ls" />
      <Handle type="target" position={Position.Right} id="rt" />
      <Handle type="source" position={Position.Top} id="t" />
      <Handle type="target" position={Position.Top} id="tt" />
      <Handle type="source" position={Position.Bottom} id="b" />
      <Handle type="target" position={Position.Bottom} id="bt" />

      {placeholder ? (
        <div className="flex items-start gap-2.5 py-2.5 pl-3.5 pr-3">
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
          <div className="flex items-start gap-2.5 py-2.5 pl-3.5 pr-3">
            <SourceIcon type={s.type} size={16} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium leading-5">{s.name}</div>
              <div className="truncate text-[11px] text-muted-foreground">
                {fmtInt(s.records)} {s.recordNoun}
              </div>
            </div>
            {s.ownerId ? (
              <ActorAvatar id={s.ownerId} size="xs" className="mt-0.5" />
            ) : (
              <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-abort-soft text-abort" title="No owner">
                <UserX className="h-3 w-3" />
              </span>
            )}
          </div>
          <div className="flex items-center justify-between border-t px-3 py-1.5">
            <VerdictPill verdict={verdict} />
            {state.noOwner && <span className="rounded-full bg-abort-soft px-1.5 text-[10px] font-medium text-abort">No owner</span>}
            {verdict === "restricted" && <Lock className="h-3 w-3 text-merged" />}
          </div>
        </>
      )}
      <PolicyBadges ids={state.policies} />
    </motion.div>
  )
}

function BrainNode({ data }: NodeProps<Node<BrainNodeData>>) {
  const pct = Math.round((data.merged / BRAIN.total) * 100)
  const full = data.merged >= BRAIN.mergedAfter
  return (
    <motion.div
      {...ENTER}
      animate={{ opacity: data.hidden ? 0 : 1, scale: data.hidden ? 0.92 : 1 }}
      className={cn("relative w-[236px] rounded-xl border-2 bg-card p-4 shadow-md transition-colors duration-500", full ? "border-merged" : data.merged > 0 ? "border-verified" : "border-dashed border-signal/50")}
    >
      <Handle type="target" position={Position.Left} id="l" />
      <Handle type="target" position={Position.Right} id="rt" />
      <Handle type="target" position={Position.Top} id="tt" />
      <Handle type="target" position={Position.Bottom} id="bt" />
      <div className="flex items-center gap-2.5">
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors duration-500 dark:text-ink", full ? "bg-merged" : data.merged > 0 ? "bg-verified" : "bg-signal")}>
          <Brain className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold leading-5">Ashcombe firm brain</div>
          <div className="truncate text-[11px] text-muted-foreground">{data.scoped ? "scoped to Marcus's book" : data.listening ? "Listening to interviews" : "Owned by the firm · local"}</div>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-baseline justify-between text-[11px]">
          <span className="text-muted-foreground">Merged</span>
          <span className="font-mono font-medium tabular">
            {data.merged} of {BRAIN.total} sources
          </span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
          <motion.div className={cn("h-full rounded-full", full ? "bg-merged" : "bg-verified")} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
        </div>
      </div>
      <PolicyBadges ids={data.policies} />
    </motion.div>
  )
}

const nodeTypes = { source: SourceNode, brain: BrainNode }

// ---------------------------------------------------------------------------
// Edge component: draws in with a stroke-dash animation, then settles into its style
// ---------------------------------------------------------------------------

function DrawEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps<Edge<{ kind: "dep" | "brain"; hidden: boolean }>>) {
  const [path] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, borderRadius: 10 })
  const [drawn, setDrawn] = React.useState(false)
  React.useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 560)
    return () => clearTimeout(t)
  }, [])
  const brain = data?.kind === "brain"
  if (drawn) {
    return <BaseEdge id={id} path={path} className={brain ? "edge-brain" : "edge-dep"} style={brain ? { stroke: "var(--verified)" } : { stroke: "var(--signal)", opacity: 0.7 }} />
  }
  return (
    <motion.path
      d={path}
      fill="none"
      stroke={brain ? "var(--verified)" : "var(--signal)"}
      strokeWidth={1.5}
      initial={{ pathLength: 0, opacity: 0.2 }}
      animate={{ pathLength: 1, opacity: brain ? 1 : 0.7 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    />
  )
}

const edgeTypes = { draw: DrawEdge }

// ---------------------------------------------------------------------------
// Graph assembly
// ---------------------------------------------------------------------------

const W = 212
const H = 70

function posOf(id: string) {
  return id === "brain" ? BRAIN_POS : SOURCE_BY_ID[id as SourceId].pos
}

/** Pick handles from relative positions so edges leave and enter on sensible sides. */
function handlesFor(a: string, b: string): { sourceHandle: string; targetHandle: string } {
  const pa = posOf(a)
  const pb = posOf(b)
  const dx = pb.x - pa.x
  const dy = pb.y - pa.y
  if (dx > W * 0.6) return { sourceHandle: "r", targetHandle: "l" }
  if (dx < -W * 0.6) return { sourceHandle: "ls", targetHandle: "rt" }
  if (dy > H) return { sourceHandle: "b", targetHandle: "tt" }
  return { sourceHandle: "t", targetHandle: "bt" }
}

export type CanvasMode = "intake" | "map"

type Props = {
  mode: CanvasMode
  selectedId?: SourceId | null
  onSelect?: (id: SourceId | null) => void
  /** Padding for fitView. */
  padding?: number
  /** Verdicts toggled off in the legend. */
  hiddenVerdicts?: Set<Verdict>
}

function CanvasInner({ mode, selectedId, onSelect, padding = 0.14, hiddenVerdicts }: Props) {
  const brainVisible = useDemo((s) => s.brainVisible)
  const brainMerged = useDemo((s) => s.brainMerged)
  const brainPolicies = useDemo((s) => s.brainPolicies)
  const nodeStates = useDemo((s) => s.nodes)
  const edgeIds = useDemo((s) => s.edges)
  const viewAs = useDemo((s) => s.viewAs)
  const readiness = useDemo((s) => s.readiness)
  const intakePhase = useDemo((s) => s.intakePhase)
  const { fitView } = useReactFlow()

  const scope = mode === "map" ? VIEW_SCOPE[viewAs] : "all"
  const visible = (id: string) => scope === "all" || scope.includes(id as SourceId)

  const nodes = React.useMemo<Node[]>(() => {
    const out: Node[] = []
    if (brainVisible) {
      out.push({
        id: "brain",
        type: "brain",
        position: BRAIN_POS,
        initialWidth: 236,
        initialHeight: 116,
        draggable: false,
        selectable: false,
        data: { merged: brainMerged, policies: brainPolicies, hidden: false, scoped: mode === "map" && viewAs === "marcus-assistant", listening: readiness === "idle" && intakePhase !== "done" } satisfies BrainNodeData,
      })
    }
    for (const s of SOURCES) {
      const st = nodeStates[s.id]
      if (!st) continue
      const hidden = !visible(s.id) || (mode === "map" && !!hiddenVerdicts?.has(st.verdict))
      out.push({
        id: s.id,
        type: "source",
        position: s.pos,
        initialWidth: W,
        initialHeight: H,
        draggable: false,
        selected: selectedId === s.id,
        className: hidden ? "hidden-node" : undefined,
        data: { source: s, state: st, hidden } satisfies SourceNodeData,
      })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brainVisible, brainMerged, brainPolicies, nodeStates, viewAs, mode, selectedId, readiness, intakePhase, hiddenVerdicts])

  const edges = React.useMemo<Edge[]>(() => {
    const out: Edge[] = []
    for (const id of edgeIds) {
      const dep = DEP_EDGES.find((e) => e.id === id)
      const [source, target] = dep ? [dep.source, dep.target] : [id.split(">")[0], "brain"]
      if (!nodeStates[source] || (target !== "brain" && !nodeStates[target])) continue
      if (target === "brain" && !brainVisible) continue
      const hiddenBy = (id: string) => mode === "map" && !!hiddenVerdicts?.has(nodeStates[id]?.verdict ?? "unchecked")
      const hidden = !visible(source) || hiddenBy(source) || (target !== "brain" && (!visible(target) || hiddenBy(target)))
      out.push({ id, source, target, type: "draw", ...handlesFor(source, target), className: hidden ? "edge-hidden" : undefined, data: { kind: dep ? "dep" : "brain", hidden } })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edgeIds, nodeStates, brainVisible, viewAs, mode, hiddenVerdicts])

  // Gentle re-fit whenever something lands or the viewer changes.
  const visibleKey = nodes.filter((n) => !(n.data as { hidden: boolean }).hidden).map((n) => n.id).join(",")
  const fit = React.useCallback(
    (duration = 400) => {
      const visibleNodes = nodes.filter((n) => !(n.data as { hidden: boolean }).hidden).map((n) => ({ id: n.id }))
      if (!visibleNodes.length) return
      fitView({ duration, padding, nodes: visibleNodes, maxZoom: 1.1 })
    },
    [fitView, nodes, padding],
  )
  React.useEffect(() => {
    const t = setTimeout(() => fit(400), 60)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleKey, mode])

  // Re-fit when the pane resizes (intake → map hands the canvas the full width).
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

  const empty = !brainVisible && nodes.length === 0

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
        fitViewOptions={{ padding }}
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
        {mode === "map" && (
          <MiniMap
            position="bottom-right"
            pannable
            zoomable
            nodeColor={(n) => {
              if ((n.data as { hidden?: boolean }).hidden) return "transparent"
              if (n.type === "brain") return brainMerged >= BRAIN.mergedAfter ? "#6b4fbb" : "#2e6f4e"
              return VERDICT_HEX[((n.data as SourceNodeData).state.verdict ?? "unchecked") as Verdict]
            }}
            nodeStrokeWidth={0}
            maskColor="color-mix(in srgb, var(--background) 70%, transparent)"
          />
        )}
      </ReactFlow>
      {empty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl border border-dashed bg-card/80 px-6 py-5 text-center shadow-sm backdrop-blur">
            <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-signal-soft text-signal">
              <Brain className="h-4 w-4" />
            </span>
            <div className="text-sm font-medium">Nothing mapped yet</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Start the interview and the firm builds here, one answer at a time.</div>
          </div>
        </div>
      )}
    </div>
  )
}

export function BrainCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  )
}
