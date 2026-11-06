"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Bot, Code2, FileText, Lock, MessageSquareQuote, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ActorAvatar, ActorName, ModelBadge, getActor } from "@/components/demo/actor"
import { Card, CardHeader, PageHeader } from "@/components/demo/page"
import { AgentStatusPill } from "@/components/demo/verdict-pill"
import { ACCESS_LABEL, ACCESS_ORDER, AGENTS, AGENT_ORDER, AGENT_POLICY, MATRIX_AGENTS, MATRIX_PEOPLE, POLICY_BY_ID, RESOURCES, href, type AccessLevel, type Matrix, type ResourceId } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

const LEVEL_CLASS: Record<AccessLevel, string> = {
  none: "text-muted-foreground",
  read: "text-foreground",
  own: "text-signal",
  propose: "text-flagged",
  approve: "text-verified",
}

function AgentPolicyCard({ agentId }: { agentId: string }) {
  const [mode, setMode] = React.useState<"readable" | "code">("readable")
  const liveAgents = useDemo((s) => s.liveAgents)
  const policiesLanded = useDemo((s) => s.policies)
  const a = AGENTS[agentId]
  const p = AGENT_POLICY[agentId]
  const status = liveAgents.includes(agentId) ? "live" : (a.status ?? "queued")
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <ActorAvatar id={agentId} size="sm" />
        <span className="min-w-0 flex-1 truncate font-mono text-[13px] font-medium">{a.name}</span>
        <AgentStatusPill status={status} />
        <div className="ml-1 flex items-center rounded-md border bg-muted p-0.5 text-[11px]">
          <button onClick={() => setMode("readable")} aria-pressed={mode === "readable"} className={cn("inline-flex h-6 items-center gap-1 rounded px-2 font-medium transition-colors", mode === "readable" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            <FileText className="h-3 w-3" /> Readable
          </button>
          <button onClick={() => setMode("code")} aria-pressed={mode === "code"} className={cn("inline-flex h-6 items-center gap-1 rounded px-2 font-medium transition-colors", mode === "code" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            <Code2 className="h-3 w-3" /> Policy as code
          </button>
        </div>
      </div>
      <div className="min-h-[132px] px-4 py-3">
        <AnimatePresence mode="wait" initial={false}>
          {mode === "readable" ? (
            <motion.div key="readable" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <p className="text-sm font-medium leading-6">{p.readable}</p>
              <ul className="mt-2 space-y-1.5">
                {p.ruleIds.map((id) => {
                  const rule = POLICY_BY_ID[id]
                  return (
                    <li key={id} className="flex flex-wrap items-center gap-2 text-xs">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-merged" />
                      <span className="text-foreground">{rule.rule}.</span>
                      {rule.fromClarification ? (
                        <Link href={href(`/requests/r-3#entry-${rule.transcriptId}`)} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" title="Open the transcript line">
                          <Badge variant="merged" className="gap-1 hover:bg-merged/20">
                            <MessageSquareQuote className="h-3 w-3" /> From clarification{policiesLanded.includes(id) ? "" : " · not yet played"}
                          </Badge>
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">{rule.sourceLabel}, {rule.date}</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </motion.div>
          ) : (
            <motion.pre key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-[11.5px] leading-5">
              {p.code.join("\n")}
            </motion.pre>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-auto border-t bg-muted/30 px-4 py-2.5">
        <div className="mb-1 text-[11px] font-medium text-muted-foreground">Enforcement points</div>
        <ul className="flex flex-wrap gap-1.5">
          {p.enforcement.map((e) => (
            <li key={e} className="inline-flex items-center gap-1 rounded border bg-card px-1.5 py-0.5 text-[11px]">
              <Lock className="h-3 w-3 text-merged" /> {e}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

function MatrixRow({ actor, matrix, dirty }: { actor: string; matrix: Matrix; dirty: Set<string> }) {
  const setCell = useDemo((s) => s.setCell)
  const a = getActor(actor)
  return (
    <TableRow className="transition-colors">
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
              <SelectTrigger className={cn("h-7 w-[112px] bg-card px-2 text-xs", LEVEL_CLASS[level], changed && "ring-2 ring-flagged/50 ring-offset-1 ring-offset-background")} aria-label={`${a.name} access to ${r.label}`}>
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
  const current = draft ?? matrix

  const dirty = React.useMemo(() => {
    const d = new Set<string>()
    if (!draft) return d
    for (const a of Object.keys(draft)) for (const r of Object.keys(draft[a])) if (draft[a][r as ResourceId] !== matrix[a][r as ResourceId]) d.add(`${a}:${r}`)
    return d
  }, [draft, matrix])

  return (
    <div className="relative">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader title="People and agents × deals" action={<span className="text-xs text-muted-foreground">Changes take effect at the source on save</span>} />
        <div className="overflow-x-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[230px]">Person or agent</TableHead>
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
                    <Bot className="h-3.5 w-3.5 text-muted-foreground" /> Agents <ModelBadge />
                  </span>
                </TableCell>
              </TableRow>
              {MATRIX_AGENTS.map((a) => (
                <MatrixRow key={a} actor={a} matrix={current} dirty={dirty} />
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center gap-2 border-t bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
          <Lock className="h-3 w-3" /> Own deal: the person&apos;s or agent&apos;s own deal only. Admin seats carry no data access by default; Dana Ruiz reads nothing in LP data or fee &amp; carry.
        </div>
      </Card>

      <AnimatePresence>
        {draft && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="sticky bottom-4 z-20 mt-4 flex items-center gap-3 rounded-xl border border-flagged/40 bg-card px-4 py-3 shadow-lg"
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

export default function PoliciesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <PageHeader
        title="Policies"
        description="One policy per agent, written from the request and the clarifications. Enforced where the data lives, for people and for agents."
        actions={
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ActorAvatar id="grace" size="xs" /> <ActorName id="grace" /> approves changes
          </span>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {AGENT_ORDER.map((id) => (
          <AgentPolicyCard key={id} agentId={id} />
        ))}
      </div>
      <MatrixSection />
    </div>
  )
}
