"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Lock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogDescription, DialogTitle, SheetContent } from "@/components/ui/dialog"
import { ActorAvatar, ActorName, getActor } from "@/components/demo/actor"
import { useCanvasSelection } from "@/components/demo/canvas-context"
import { ColourDot, ColourPill } from "@/components/demo/status-pill"
import { COLOUR_LABEL, COLOUR_MEANING, CURRENT_USER, SOURCES, SOURCE_BY_ID, colourFor, countColours, type Colour, type Source, type SourceId } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

const LEGEND: Colour[] = ["green", "yellow", "red", "black"]

function SourceParam() {
  const params = useSearchParams()
  const { setSelected } = useCanvasSelection()
  React.useEffect(() => {
    const id = params.get("source") as SourceId | null
    if (id && SOURCE_BY_ID[id]) setSelected(id)
  }, [params, setSelected])
  return null
}

function Toolbar() {
  const overrides = useDemo((s) => s.overrides)
  const readiness = useDemo((s) => s.readiness)
  const tour = useDemo((s) => s.seq.tour)
  const startSeq = useDemo((s) => s.startSeq)
  const rec = useDemo((s) => s.rec)
  const counts = countColours(CURRENT_USER.id, overrides)
  return (
    <div className="absolute inset-x-4 top-3 z-10 flex items-start justify-between gap-3">
      <div className="rounded-lg border bg-card/95 px-3.5 py-2 shadow-sm backdrop-blur">
        <h1 className="font-display text-[18px] font-medium leading-6 tracking-[-0.02em]">Firm map</h1>
        <p className="text-xs text-muted-foreground">
          {SOURCES.length} sources · as seen by {CURRENT_USER.name} · AI-readiness <span className="font-mono font-medium text-verified tabular">{readiness}%</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-3 rounded-md border bg-card/95 px-3 py-1.5 text-[11px] shadow-sm backdrop-blur lg:flex">
          {LEGEND.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5">
              <ColourDot colour={c} />
              {COLOUR_LABEL[c]} <span className="font-mono text-muted-foreground tabular">{counts[c]}</span>
            </span>
          ))}
        </div>
        {!rec && (
          <Button size="sm" variant="outline" className="bg-card/95" onClick={() => startSeq("tour")} disabled={tour === "playing"} id="start-tour">
            <Play /> {tour === "done" ? "Replay tour" : "Tour the colours"}
          </Button>
        )}
      </div>
    </div>
  )
}

function SourceSheet({ source: s }: { source: Source }) {
  const overrides = useDemo((st) => st.overrides)
  const colour = colourFor(s.id, CURRENT_USER.id, overrides)
  if (colour === "black") {
    const team = getActor(s.teamId ?? s.ownerId)
    return (
      <div className="flex flex-col">
        <div className="border-b bg-ink p-5 text-paper">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper/10">
              <Lock className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold leading-6">Restricted</DialogTitle>
              <DialogDescription className="text-xs text-paper/70">Owned by {team.name}</DialogDescription>
            </div>
          </div>
        </div>
        <div className="space-y-3 p-5 text-sm">
          <p>{COLOUR_MEANING.black}</p>
          <p className="text-muted-foreground">No name, contents, schema or counts are shown. Maya cannot ask an agent to read it either: the restriction is enforced at the source, not in this screen.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col">
      <div className="border-b p-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base font-semibold leading-6">{s.name}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">{s.system}</DialogDescription>
          </div>
          <ColourPill colour={colour} className="mr-6" />
        </div>
      </div>
      <div className="space-y-5 p-5 text-sm">
        <div className={cn("rounded-lg border p-3", colour === "green" ? "border-verified/30 bg-verified-soft" : colour === "yellow" ? "border-flagged/30 bg-flagged-soft" : "border-abort/30 bg-abort-soft")}>
          <div className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{COLOUR_LABEL[colour]}</div>
          <div>{s.why}</div>
        </div>
        <dl className="divide-y">
          {[
            ["Owner", <span key="o" className="flex items-center gap-2"><ActorAvatar id={s.ownerId} size="xs" /><ActorName id={s.ownerId} withRole /></span>],
            ["What is there", s.records],
            ["Distance to the brain", COLOUR_MEANING[colour]],
          ].map(([k, v]) => (
            <div key={k as string} className="grid grid-cols-[130px_1fr] gap-3 py-2">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="min-w-0">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

export default function MapPage() {
  const { selected, setSelected } = useCanvasSelection()
  const source = selected ? SOURCE_BY_ID[selected] : null
  return (
    <>
      <React.Suspense fallback={null}>
        <SourceParam />
      </React.Suspense>
      <Toolbar />
      <Dialog open={!!source} onOpenChange={(o) => !o && setSelected(null)} modal={false}>
        <SheetContent className="top-14 overflow-y-auto" overlay={false} onInteractOutside={(e) => { if ((e.target as HTMLElement)?.closest?.(".react-flow__node")) e.preventDefault() }}>
          {source && <SourceSheet source={source} />}
        </SheetContent>
      </Dialog>
    </>
  )
}
