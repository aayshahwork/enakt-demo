"use client"

import * as React from "react"
import type { SourceId } from "@/lib/demo/fixtures"

type Ctx = { selected: SourceId | null; setSelected: (id: SourceId | null) => void }
const CanvasSelectionContext = React.createContext<Ctx | null>(null)

export function CanvasSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = React.useState<SourceId | null>(null)
  const value = React.useMemo(() => ({ selected, setSelected }), [selected])
  return <CanvasSelectionContext.Provider value={value}>{children}</CanvasSelectionContext.Provider>
}

export function useCanvasSelection() {
  const ctx = React.useContext(CanvasSelectionContext)
  if (!ctx) throw new Error("useCanvasSelection must be used inside CanvasSelectionProvider")
  return ctx
}
