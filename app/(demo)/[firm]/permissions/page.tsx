"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Bot, Lock, ShieldCheck, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ActorAvatar, ActorName, LocalModelBadge, getActor } from "@/components/demo/actor"
import { Card, CardHeader, PageHeader } from "@/components/demo/page"
import { VERDICT_HEX } from "@/components/demo/verdict-pill"
import {
  ACCESS_LABEL,
  ACCESS_ORDER,
  AGENTS,
  BRAIN_POS,
  MATRIX_AGENTS,
  MATRIX_PEOPLE,
  POLICIES,
  RESOURCES,
  SOURCES,
  SOURCE_BY_ID,
  href,
  type AccessLevel,
  type Matrix,
  type ResourceId,
  type SourceId,
  VIEW_SCOPE,
} from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

const LEVEL_CLASS: Record<AccessLevel, string> = {
  none: "text-muted-foreground",
  read: "text-foreground",
  own: "text-signal",
  propose: "text-flagged",
  approve: "text-verified",
}

function governsLabel(id: string) {
  if (id === "brain") return "Firm brain"
  return SOURCE_BY_ID[id as SourceId]?.name ?? id
}

function PoliciesSection() {
  const discovered = useDemo((s) => s.policies)
  return (
    <Card>
      <CardHeader title="Policies" action={<span className="text-xs text-muted-foreground">{POLICIES.length} rules · all enforced at the data layer</span>} />
      <ul className="divide-y">
        {POLICIES.map((p) => {
          const actor = getActor(p.sourceId)
          const isPerson = actor.kind === "person"
          const landed = discovered.includes(p.id)
          return (
            <li key={p.id} className="flex items-start gap-3 px-4 py-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-merged-soft text-merged">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{p.rule}</span>
                  {p.fromIntake && (
                    <Link href={href("/intake")} title="Open the transcript line" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <Badge variant="merged" className="gap-1 hover:bg-merged/20">
                        <Sparkles className="h-3 w-3" /> {landed ? "From intake" : "From intake · scheduled"}
                      </Badge>
                    </Link>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {isPerson && <ActorAvatar id={p.sourceId} size="xs" />}
                  <span>
                    {p.sourceLabel}, {p.date}
                  </span>
                  {p.governs.length > 0 && (
                    <>
                      <span>·</span>
                      <span className="inline-flex flex-wrap gap-1">
                        {p.governs.map((g) => (
                          <span key={g} className="rounded border bg-muted px-1.5 py-0.5 text-[11px] text-foreground">
                            {governsLabel(g)}
                          </span>
                        ))}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Badge variant="verified" className="shrink-0 gap-1">
                <Lock className="h-3 w-3" /> Enforced at data layer
              </Badge>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

function reachableSources(matrix: Matrix, agent: string): Set<SourceId> {
  const row = matrix[agent]
  const out = new Set<SourceId>()
  if (!row) return out
  if (agent === "marcus-assistant") {
    for (const id of VIEW_SCOPE["marcus-assistant"] as SourceId[]) if (row["client-records"] !== "none" || row["client-documents"] !== "none") out.add(id)
    return out
  }
  for (const s of SOURCES) {
    if (s.resource) {
      if (row[s.resource] !== "none") out.add(s.id)
    } else if (row["client-records"] !== "none") {
      out.add(s.id)
    }
  }
  return out
}

function ReachPreview({ agent, matrix }: { agent: string; matrix: Matrix }) {
  const reach = reachableSources(matrix, agent)
  const NW = 212
  const NH = 70
  return (
    <Card className="sticky top-6">
      <CardHeader title="What this agent can reach" />
      <div className="p-4">
        <svg viewBox="0 0 1120 560" className="block w-full" aria-label={`Sources reachable by ${agent}`}>
          <rect x={BRAIN_POS.x} y={BRAIN_POS.y} width={236} height={130} rx={14} fill="var(--card)" stroke="var(--merged)" strokeWidth={4} style={{ transition: "opacity 200ms ease-out" }} />
          <text x={BRAIN_POS.x + 118} y={BRAIN_POS.y + 72} textAnchor="middle" fontSize={26} fontWeight={600} fill="var(--foreground)" fontFamily="var(--font-body)">
            Firm brain
          </text>
          {SOURCES.map((s) => {
            const on = reach.has(s.id)
            return (
              <g key={s.id} style={{ opacity: on ? 1 : 0.15, transition: "opacity 200ms ease-out" }}>
                <rect x={s.pos.x} y={s.pos.y} width={NW} height={NH} rx={10} fill={VERDICT_HEX[s.verdict]} />
                <text x={s.pos.x + 14} y={s.pos.y + 42} fontSize={22} fontWeight={500} fill="#ffffff" fontFamily="var(--font-body)">
                  {s.name.length > 18 ? s.name.slice(0, 17) + "…" : s.name}
                </text>
              </g>
            )
          })}
        </svg>
        <div className="mt-3 flex items-center gap-2">
          <ActorAvatar id={agent} size="sm" />
          <div className="min-w-0">
            <div className="truncate font-mono text-[13px] font-medium">{agent}</div>
            <div className="text-xs text-muted-foreground tabular">
              {reach.size} of {SOURCES.length} sources reachable
            </div>
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-4 text-muted-foreground">Hover an agent row to preview its reach. Faded sources are invisible to it, not just read-only.</p>
      </div>
    </Card>
  )
}

function MatrixRow({ actor, matrix, dirty, onHover }: { actor: string; matrix: Matrix; dirty: Set<string>; onHover?: (id: string | null) => void }) {
  const setCell = useDemo((s) => s.setCell)
  const a = getActor(actor)
  return (
    <TableRow onMouseEnter={() => onHover?.(actor)} onMouseLeave={() => onHover?.(null)} className="transition-colors">
      <TableCell className="whitespace-nowrap">
        <span className="inline-flex items-center gap-2">
          <ActorAvatar id={actor} size="sm" />
          <span className="min-w-0">
            <span className={cn("block text-sm font-medium leading-5", a.kind === "agent" && "font-mono text-[13px]")}>{a.name}</span>
            <span className="block text-[11px] leading-4 text-muted-foreground">{a.role}</span>
          </span>
        </span>
      </TableCell>
      {RESOURCES.map((r) => {
        const level = matrix[actor]?.[r.id] ?? "none"
        const changed = dirty.has(`${actor}:${r.id}`)
        return (
          <TableCell key={r.id} className="px-2">
            <Select value={level} onValueChange={(v) => setCell(actor, r.id, v as AccessLevel)}>
              <SelectTrigger
                className={cn("h-7 w-[104px] bg-card px-2 text-xs", LEVEL_CLASS[level], changed && "ring-2 ring-flagged/50 ring-offset-1 ring-offset-background")}
                aria-label={`${a.name} access to ${r.label}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCESS_ORDER.map((l) => (
                  <SelectItem key={l} value={l} className={cn("text-xs", LEVEL_CLASS[l])}>
                    {ACCESS_LABEL[l]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableCell>
        )
      })}
    </TableRow>
  )
}

function MatrixSection() {
  const matrix = useDemo((s) => s.matrix)
  const draft = useDemo((s) => s.draft)
  const discardDraft = useDemo((s) => s.discardDraft)
  const saveDraft = useDemo((s) => s.saveDraft)
  const [hovered, setHovered] = React.useState<string | null>(null)
  const [last, setLast] = React.useState<string>("marcus-assistant")
  const current = draft ?? matrix

  const dirty = React.useMemo(() => {
    const d = new Set<string>()
    if (!draft) return d
    for (const a of Object.keys(draft)) for (const r of Object.keys(draft[a])) if (draft[a][r as ResourceId] !== matrix[a][r as ResourceId]) d.add(`${a}:${r}`)
    return d
  }, [draft, matrix])

  const onHoverAgent = (id: string | null) => {
    setHovered(id)
    if (id) setLast(id)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader title="Access matrix" action={<span className="text-xs text-muted-foreground">Changes take effect at the data layer on save</span>} />
        <div className="overflow-x-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[190px]">Person or agent</TableHead>
                {RESOURCES.map((r) => (
                  <TableHead key={r.id} className="px-2 text-xs">
                    {r.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {MATRIX_PEOPLE.map((p) => (
                <MatrixRow key={p} actor={p} matrix={current} dirty={dirty} />
              ))}
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableCell colSpan={RESOURCES.length + 1} className="py-2">
                  <span className="inline-flex items-center gap-2 text-xs font-medium">
                    <Bot className="h-3.5 w-3.5 text-muted-foreground" /> Agents <LocalModelBadge />
                  </span>
                </TableCell>
              </TableRow>
              {MATRIX_AGENTS.map((a) => (
                <MatrixRow key={a} actor={a} matrix={current} dirty={dirty} onHover={onHoverAgent} />
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center gap-2 border-t bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
          <ActorAvatar id="intake-agent" size="xs" /> {AGENTS["intake-agent"].name} reads metadata only and has no data access.
        </div>
      </Card>
      <ReachPreview agent={hovered ?? last} matrix={current} />

      <AnimatePresence>
        {draft && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="sticky bottom-4 z-20 flex items-center gap-3 rounded-xl border border-flagged/40 bg-card px-4 py-3 shadow-lg lg:col-span-2"
          >
            <span className="h-2 w-2 rounded-full bg-flagged" />
            <span className="text-sm font-medium">Unsaved policy changes</span>
            <span className="text-xs text-muted-foreground tabular">
              · {dirty.size} cell{dirty.size === 1 ? "" : "s"}
            </span>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={discardDraft}>
              Discard
            </Button>
            <Button variant="signal" size="sm" onClick={saveDraft} id="save-policy">
              Save
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PermissionsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <PageHeader
        title="Permissions"
        description="Rules written from what people said in interviews. Enakt enforces them where the data lives, for people and for agents."
        actions={
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ActorAvatar id="dana" size="xs" /> <ActorName id="dana" /> can approve changes
          </span>
        }
      />
      <PoliciesSection />
      <MatrixSection />
    </div>
  )
}
