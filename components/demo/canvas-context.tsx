"use client"

import * as React from "react"
import type { SourceId, Verdict } from "@/lib/demo/fixtures"

type Ctx = {
  selected: SourceId | null
  setSelected: (id: SourceId | null) => void
  hiddenVerdicts: Set<Verdict>
  toggleVerdict: (v: Verdict) => void
  clearVerdicts: () => void
}

const CanvasSelectionContext = React.createContext<Ctx | null>(null)

export function CanvasSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = React.useState<SourceId | null>(null)
  const [hiddenVerdicts, setHidden] = React.useState<Set<Verdict>>(() => new Set())
  const toggleVerdict = React.useCallback((v: Verdict) => {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(v)) next.delete(v)
      else next.add(v)
      return next
    })
  }, [])
  const clearVerdicts = React.useCallback(() => setHidden(new Set()), [])
  const value = React.useMemo(() => ({ selected, setSelected, hiddenVerdicts, toggleVerdict, clearVerdicts }), [selected, hiddenVerdicts, toggleVerdict, clearVerdicts])
  return <CanvasSelectionContext.Provider value={value}>{children}</CanvasSelectionContext.Provider>
}

export function useCanvasSelection() {
  const ctx = React.useContext(CanvasSelectionContext)
  if (!ctx) throw new Error("useCanvasSelection must be used inside CanvasSelectionProvider")
  return ctx
}
