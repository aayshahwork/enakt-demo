"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Check, Clock } from "lucide-react"
import { FirmMap } from "@/components/demo/firm-map"
import { CanvasSelectionProvider, useCanvasSelection } from "@/components/demo/canvas-context"
import { ActorAvatar, getActor } from "@/components/demo/actor"
import { CONFIRMATIONS, SCOPE } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

/** Beat 4, right side: the data the agent will need lights up as each answer lands. */
function ScopeHeader() {
  const lit = useDemo((s) => s.lit)
  const excluded = useDemo((s) => s.excluded)
  const confirmations = useDemo((s) => s.confirmations)
  const confirmed = Object.values(confirmations).filter((c) => c === "done").length
  return (
    <div className="flex items-center gap-3 border-b bg-background/95 px-4 py-2 text-xs">
      <span className="font-medium">What the agent will need</span>
      <span className="font-mono text-muted-foreground tabular">
        {lit.length} of {SCOPE.sources.length} sources · {excluded.length} excluded · owners {confirmed} of {CONFIRMATIONS.length}
      </span>
    </div>
  )
}

function OwnersToConfirm() {
  const confirmations = useDemo((s) => s.confirmations)
  return (
    <div className="border-t bg-card">
      <div className="px-4 pb-1 pt-2.5 text-xs font-medium">Owners to confirm</div>
      <ul className="divide-y">
        {CONFIRMATIONS.map((c) => {
          const st = confirmations[c.id]
          const p = getActor(c.personId)
          return (
            <li key={c.id} className="flex items-center gap-3 px-4 py-2">
              <ActorAvatar id={c.personId} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span className="truncate text-xs text-muted-foreground">· {p.role}</span>
                </div>
                <div className={cn("truncate text-xs", st === "done" ? "text-foreground" : "text-muted-foreground")}>{st === "done" ? `“${c.reply}”` : st === "pending" ? `Asked: ${c.ask}` : c.ask}</div>
              </div>
              {st === "done" ? (
                <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-1 rounded-full bg-verified-soft px-2 py-0.5 text-[11px] font-medium text-verified">
                  <Check className="h-3 w-3" /> Confirmed
                </motion.span>
              ) : st === "pending" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-signal-soft px-2 py-0.5 text-[11px] font-medium text-signal">
                  <span className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-signal" /> Asked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> Waiting
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Frame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const request = pathname.includes("/requests/")
  const { selected, setSelected } = useCanvasSelection()
  return (
    <div className="flex h-full min-h-0">
      {request && (
        <motion.aside key="request-pane" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="flex w-[46%] min-w-0 shrink-0 flex-col border-r bg-background">
          {children}
        </motion.aside>
      )}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {request && <ScopeHeader />}
        <div className="relative min-h-0 flex-1">
          <FirmMap mode={request ? "scope" : "map"} selectedId={selected} onSelect={setSelected} padding={request ? 0.06 : { top: "96px", bottom: "28px", left: "28px", right: "28px" }} />
          {!request && <div className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto">{children}</div>}
        </div>
        {request && <OwnersToConfirm />}
      </div>
    </div>
  )
}

/** The firm map and the request page share this layout so the React Flow canvas stays mounted. */
export default function CanvasLayout({ children }: { children: React.ReactNode }) {
  return (
    <CanvasSelectionProvider>
      <Frame>{children}</Frame>
    </CanvasSelectionProvider>
  )
}
