"use client"

import * as React from "react"
import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"
import { Info, Lock, Save, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, PageHeader } from "@/components/demo/page"
import { ActorAvatar, ActorName, getActor } from "@/components/demo/actor"
import { ACCESS_LABEL, ACCESS_NOTE, ACCESS_RESOURCES, ACCESS_ROWS, type AccessLevel, type ResourceId } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

const LEVELS: AccessLevel[] = ["none", "read", "write", "approve"]
const LEVEL_TONE: Record<AccessLevel, string> = {
  none: "text-muted-foreground",
  read: "text-foreground",
  write: "text-signal",
  approve: "text-verified",
}

export default function AccessPage() {
  const { state, dispatch } = useDemo()
  const [draft, setDraft] = React.useState(state.access)
  React.useEffect(() => setDraft(state.access), [state.access])

  const changes = ACCESS_ROWS.flatMap((r) => ACCESS_RESOURCES.filter((c) => draft[r][c.id] !== state.access[r][c.id]).map((c) => ({ r, c: c.id })))
  const dirty = changes.length > 0

  const set = (r: string, c: ResourceId, v: AccessLevel) => setDraft((d) => ({ ...d, [r]: { ...d[r], [c]: v } }))
  const save = () => {
    dispatch({ type: "access:set", access: draft })
    toast.success(`Saved ${changes.length} permission ${changes.length === 1 ? "change" : "changes"}`, {
      description: changes.map(({ r, c }) => `${getActor(r).name} · ${ACCESS_RESOURCES.find((x) => x.id === c)?.name} → ${ACCESS_LABEL[draft[r][c]]}`).join(" · "),
    })
    dispatch({
      type: "activity:add",
      entry: { id: `access-${Date.now()}`, at: new Date("2026-10-29T16:42:00-04:00"), actorId: "dana", text: `changed ${changes.length} permission${changes.length === 1 ? "" : "s"} on the access matrix`, href: "/northfield/access", kind: "access" },
    })
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 p-6 pb-24">
      <PageHeader title="Access" description="Who, and which agents, can read, write, or approve each resource." />

      <div className="flex items-center gap-2 rounded-lg border border-signal/20 bg-signal-soft/60 px-4 py-2.5 text-sm">
        <Lock className="h-4 w-4 text-signal" />
        <span className="font-medium">{ACCESS_NOTE}</span>
        <span className="text-muted-foreground">Write grants an agent permission to open one; a person still approves it.</span>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="w-[280px] px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Principal</th>
              {ACCESS_RESOURCES.map((c) => (
                <th key={c.id} className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {ACCESS_ROWS.map((r) => {
              const a = getActor(r)
              return (
                <tr key={r} className="hover:bg-muted/40">
                  <td className="px-4 py-2">
                    <span className="flex items-center gap-2.5">
                      <ActorAvatar id={r} size="sm" />
                      <span className="min-w-0">
                        <ActorName id={r} />
                        <span className="block text-xs text-muted-foreground">{a.kind === "agent" ? "Agent" : a.role}</span>
                      </span>
                    </span>
                  </td>
                  {ACCESS_RESOURCES.map((c) => {
                    const v = draft[r][c.id]
                    const changed = v !== state.access[r][c.id]
                    const locked = c.id === "comp" && a.kind === "agent"
                    return (
                      <td key={c.id} className="px-2 py-1.5">
                        <Select value={v} onValueChange={(nv) => set(r, c.id, nv as AccessLevel)} disabled={locked}>
                          <SelectTrigger
                            className={cn("w-[132px]", LEVEL_TONE[v], changed && "border-flagged bg-flagged-soft/50")}
                            aria-label={`${a.name} access to ${c.name}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LEVELS.map((l) => (
                              <SelectItem key={l} value={l} disabled={l === "approve" && a.kind === "agent"}>
                                <span className={LEVEL_TONE[l]}>{ACCESS_LABEL[l]}</span>
                                {l === "approve" && a.kind === "agent" && <span className="ml-1 text-xs text-muted-foreground">people only</span>}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="flex items-center gap-2 border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" /> Advisor compensation is partner-only. Agents cannot be granted access to it, and Approve is reserved for people.
        </div>
      </Card>

      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-xl border bg-card px-4 py-2.5 shadow-xl"
          >
            <span className="h-2 w-2 rounded-full bg-flagged" />
            <span className="text-sm font-medium">Unsaved changes</span>
            <span className="text-xs text-muted-foreground tabular">{changes.length}</span>
            <Button variant="ghost" size="sm" onClick={() => setDraft(state.access)}>
              <Undo2 /> Discard
            </Button>
            <Button variant="signal" size="sm" onClick={save}>
              <Save /> Save
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
