"use client"

import * as React from "react"
import { Background, BackgroundVariant, BaseEdge, Controls, Handle, Position, ReactFlow, ReactFlowProvider, getSmoothStepPath, useReactFlow, type Edge, type EdgeProps, type Node, type NodeProps } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { motion } from "framer-motion"
import { Brain, Database, Files, FolderOpen, Landmark, Lock, Mail, Table2, UserRound, X } from "lucide-react"
import { ActorAvatar, getActor } from "@/components/demo/actor"
import { ColourPill, COLOUR_VAR } from "@/components/demo/status-pill"
import { BRAIN_POS, COLOUR_MEANING, CURRENT_USER, NODE, PERSON_EDGES, SOURCES, SOURCE_BY_ID, TOUR, colourFor, countColours, type Colour, type Source, type SourceId } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Nodes
// ---------------------------------------------------------------------------

type SourceNodeData = { source: Source; colour: Colour; lit: boolean; excluded: boolean; dim: boolean; tour: boolean; scopeMode: boolean }
type BrainNodeData = { merged: number; total: number; lit: boolean; scopeMode: boolean }

const ENTER = { initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.3, ease: "easeOut" as const } }

function SystemIcon({ system }: { system: string }) {
  const s = system.toLowerCase()
  const Icon = s.includes("inbound") ? Mail : s.includes("dealcloud") ? Database : s.includes("data room") ? FolderOpen : s.includes("excel") ? Table2 : s.includes("fund") ? Landmark : Files
  return <Icon className="h-4 w-4" />
}

function Handles() {
  return (
    <>
      <Handle type="source" position={Position.Right} id="r" />
      <Handle type="target" position={Position.Left} id="l" />
      <Handle type="source" position={Position.Left} id="ls" />
      <Handle type="target" position={Position.Right} id="rt" />
      <Handle type="source" position={Position.Top} id="t" />
      <Handle type="target" position={Position.Top} id="tt" />
      <Handle type="source" position={Position.Bottom} id="b" />
      <Handle type="target" position={Position.Bottom} id="bt" />
    </>
  )
}

function TourCallout({ colour, below }: { colour: Colour; below: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: below ? -6 : 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className={cn("absolute left-0 z-20 w-[300px] rounded-lg border bg-card p-3 text-left text-foreground shadow-lg", below ? "top-[calc(100%+10px)]" : "bottom-[calc(100%+10px)]")}>
      <ColourPill colour={colour} />
      <div className="mt-1.5 text-[12.5px] leading-5">{COLOUR_MEANING[colour]}</div>
    </motion.div>
  )
}

function SourceNode({ data, selected }: NodeProps<Node<SourceNodeData>>) {
  const { source: s, colour, lit, excluded, dim, tour, scopeMode } = data
  const black = colour === "black"
  const person = s.kind === "person"
  const owner = getActor(s.ownerId)
  return (
    <motion.div
      {...ENTER}
      animate={{ opacity: dim ? 0.28 : 1, scale: tour ? 1.04 : 1 }}
      className={cn(
        "relative rounded-lg border shadow-sm transition-shadow duration-150",
        black ? "border-ink bg-ink text-paper" : "bg-card",
        person && !black && "border-dashed",
        lit && "ring-2 ring-signal ring-offset-2 ring-offset-background",
        tour && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
      )}
      style={{ width: NODE.w, height: NODE.h }}
    >
      <Handles />
      {!black && <span className="absolute inset-y-0 left-0 w-1 rounded-l-lg" style={{ background: COLOUR_VAR[colour] }} />}
      {black ? (
        <div className="flex h-full items-center gap-2.5 px-3.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-paper/10">
            <Lock className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium leading-5">Restricted</div>
            <div className="truncate text-[11px] text-paper/70">{getActor(s.teamId ?? s.ownerId).name}</div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-2.5 py-2 pl-3.5 pr-3">
            <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md", person ? "bg-abort-soft text-abort" : "bg-muted text-muted-foreground")}>{person ? <UserRound className="h-4 w-4" /> : <SystemIcon system={s.system} />}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium leading-5">{s.name}</div>
              <div className="truncate text-[11px] text-muted-foreground">{s.system}</div>
            </div>
            <ActorAvatar id={s.ownerId} size="xs" className="mt-0.5" />
          </div>
          <div className="flex items-center justify-between px-3 pb-1.5">
            <ColourPill colour={colour} className="h-[18px] px-1.5 text-[10px]" />
            <span className="truncate text-[10px] text-muted-foreground">{owner.name.split(" ")[0]}</span>
          </div>
        </>
      )}
      {scopeMode && excluded && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/55">
          <span className="inline-flex items-center gap-1 rounded-full border border-abort/50 bg-abort-soft px-2 py-0.5 text-[11px] font-medium text-abort">
            <X className="h-3 w-3" /> Excluded
          </span>
        </div>
      )}
      {tour && <TourCallout colour={colour} below={s.pos.y < 300} />}
    </motion.div>
  )
}

function BrainNode({ data }: NodeProps<Node<BrainNodeData>>) {
  const pct = Math.round((data.merged / data.total) * 100)
  return (
    <motion.div {...ENTER} className={cn("relative rounded-xl border-2 bg-card p-4 shadow-md", data.lit ? "border-signal ring-2 ring-signal ring-offset-2 ring-offset-background" : "border-verified")} style={{ width: NODE.brainW, height: NODE.brainH }}>
      <Handle type="target" position={Position.Left} id="l" />
      <Handle type="target" position={Position.Right} id="rt" />
      <Handle type="target" position={Position.Top} id="tt" />
      <Handle type="target" position={Position.Bottom} id="bt" />
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-verified text-white dark:text-ink">
          <Brain className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold leading-5">Central brain</div>
          <div className="truncate text-[11px] text-muted-foreground">{data.scopeMode ? "the agent reads from here too" : "cleaned, de-duplicated, one store"}</div>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-baseline justify-between text-[11px]">
          <span className="text-muted-foreground">Merged</span>
          <span className="font-mono font-medium tabular">
            {data.merged} of {data.total} sources
          </span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-verified" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </motion.div>
  )
}

const nodeTypes = { source: SourceNode, brain: BrainNode }

// ---------------------------------------------------------------------------
// Edges
// ---------------------------------------------------------------------------

type EdgeKind = "green" | "yellow" | "red" | "person" | "scope"
const EDGE_STROKE: Record<EdgeKind, string> = { green: "var(--verified)", yellow: "var(--flagged)", red: "var(--gap)", person: "var(--abort)", scope: "var(--signal)" }

function MapEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps<Edge<{ kind: EdgeKind; dim: boolean }>>) {
  const [path] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, borderRadius: 12 })
  const kind = data?.kind ?? "red"
  return <BaseEdge id={id} path={path} className={cn(`edge-${kind}`, data?.dim && "edge-dim")} style={{ stroke: EDGE_STROKE[kind] }} />
}
const edgeTypes = { map: MapEdge }

function posOf(id: string) {
  return id === "brain" ? BRAIN_POS : SOURCE_BY_ID[id as SourceId].pos
}
function handlesFor(a: string, b: string) {
  const pa = posOf(a)
  const pb = posOf(b)
  const dx = pb.x - pa.x
  const dy = pb.y - pa.y
  if (Math.abs(dx) > 300) return dx > 0 ? { sourceHandle: "r", targetHandle: "l" } : { sourceHandle: "ls", targetHandle: "rt" }
  return dy > 0 ? { sourceHandle: "b", targetHandle: "tt" } : { sourceHandle: "t", targetHandle: "bt" }
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

export type MapMode = "map" | "scope"
type Props = { mode: MapMode; selectedId?: SourceId | null; onSelect?: (id: SourceId | null) => void; padding?: number | { top?: `${number}px`; bottom?: `${number}px`; left?: `${number}px`; right?: `${number}px` } }

function MapInner({ mode, selectedId, onSelect, padding = 0.12 }: Props) {
  const overrides = useDemo((s) => s.overrides)
  const tourStep = useDemo((s) => s.tourStep)
  const lit = useDemo((s) => s.lit)
  const excluded = useDemo((s) => s.excluded)
  const { fitView } = useReactFlow()
  const viewer = CURRENT_USER.id
  const scopeMode = mode === "scope"
  const tourId = mode === "map" && tourStep >= 0 ? TOUR[tourStep]?.id : null
  const counts = countColours(viewer, overrides)

  const nodes = React.useMemo<Node[]>(() => {
    const out: Node[] = []
    const anyLit = lit.length > 0
    out.push({ id: "brain", type: "brain", position: BRAIN_POS, initialWidth: NODE.brainW, initialHeight: NODE.brainH, draggable: false, selectable: false, data: { merged: counts.green, total: SOURCES.length, lit: scopeMode && anyLit, scopeMode } satisfies BrainNodeData })
    for (const s of SOURCES) {
      const colour = colourFor(s.id, viewer, overrides)
      const isLit = scopeMode && lit.includes(s.id)
      const isExcluded = scopeMode && excluded.includes(s.id)
      const dim = scopeMode && anyLit && !isLit && !isExcluded
      out.push({ id: s.id, type: "source", position: s.pos, initialWidth: NODE.w, initialHeight: NODE.h, draggable: false, selected: selectedId === s.id, zIndex: tourId === s.id ? 10 : 0, data: { source: s, colour, lit: isLit, excluded: isExcluded, dim, tour: tourId === s.id, scopeMode } satisfies SourceNodeData })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrides, lit, excluded, scopeMode, tourId, selectedId])

  const edges = React.useMemo<Edge[]>(() => {
    const out: Edge[] = []
    const anyLit = lit.length > 0
    for (const s of SOURCES) {
      const colour = colourFor(s.id, viewer, overrides)
      if (colour === "black") continue
      const isLit = scopeMode && lit.includes(s.id)
      const kind: EdgeKind = isLit ? "scope" : colour === "green" ? "green" : colour === "yellow" ? "yellow" : "red"
      if (s.kind === "person" && !isLit) continue
      out.push({ id: `${s.id}>brain`, source: s.id, target: "brain", type: "map", ...handlesFor(s.id, "brain"), data: { kind, dim: scopeMode && anyLit && !isLit } })
    }
    for (const e of PERSON_EDGES) {
      out.push({ id: e.id, source: e.source, target: e.target, type: "map", ...handlesFor(e.source, e.target), data: { kind: "person", dim: scopeMode && anyLit && !lit.includes(e.source) } })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrides, lit, scopeMode])

  const fit = React.useCallback((duration = 400) => fitView({ duration, padding, maxZoom: 1.05 }), [fitView, padding])
  React.useEffect(() => {
    const t = setTimeout(() => fit(300), 60)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])
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

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, n) => {
          if (n.type === "source") onSelect?.(n.id as SourceId)
        }}
        onPaneClick={() => onSelect?.(null)}
        fitView
        fitViewOptions={{ padding, maxZoom: 1.05 }}
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
        {mode === "map" && <Controls showInteractive={false} position="bottom-left" />}
      </ReactFlow>
    </div>
  )
}

export function FirmMap(props: Props) {
  return (
    <ReactFlowProvider>
      <MapInner {...props} />
    </ReactFlowProvider>
  )
}
